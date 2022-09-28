import yaml from 'js-yaml';
import { escapeForRegExp } from '@sanjo/escape-for-reg-exp';

export class RuleEntry
{
    isRegex: boolean
    rule: string

    constructor(isRegex: boolean, rule: string)
    {
        this.isRegex = isRegex
        this.rule = rule
    }
}

export default class RuleList
{
    isBalloonServerStandard!: boolean
    isJsonFormat!: boolean
    configObject: any

    rulesCommon: Array<RuleEntry>
    rulesOnce: Array<RuleEntry>

    escapes = '!#$%&,~;\'.@^+-()[]{}'

    constructor()
    {
        this.rulesCommon = []
        this.rulesOnce = []
    }

    loadRules(text: string, isJsonFormat: boolean, isBalloonServerStandard: boolean)
    {
        this.isJsonFormat = isJsonFormat
        this.configObject = isJsonFormat ? JSON.parse(text) : yaml.load(text)
        this.isBalloonServerStandard = isBalloonServerStandard

        let common = !isBalloonServerStandard ? this.configObject.common_mode : this.configObject.commonMode
        let once = !isBalloonServerStandard ? this.configObject.once_mode : this.configObject.onceMode

        for (const rule of common)
            this.rulesCommon.push(this.fromRule(rule))

        for (const rule of once)
            this.rulesOnce.push(this.fromRule(rule))
    }

    removeRule(rule: string, isCommonRule: boolean)
    {
        if (isCommonRule)
        {
            let idx = this.rulesCommon.findIndex(r => r.rule == rule)
            if (idx != -1)
                this.rulesCommon.splice(idx, 1)
        } else {
            let idx = this.rulesOnce.findIndex(r => r.rule == rule)
            if (idx != -1)
                this.rulesOnce.splice(idx, 1)
        }
    }

    getRuleCount(path: string): number
    {
        let count = 0

        // console.log('path: ', path);

        for (const rule of this.rulesCommon)
            if (rule.rule.startsWith(path))
                count += 1
        
        for (const rule of this.rulesOnce)
            if (rule.rule.startsWith(path))
                count += 1

        return count
    }

    /**
     * 计算目录下的无效更新规则
     * @param path 要计算的目录
     * @param filenames 要计算的目录下的现有文件的文件名们
     * @returns 要计算的目录下的所有无效更新规则
     */
    getInvalidRules(path: string, filenames: Array<string>): [Array<string>, Array<string>]
    {
        function findInvalid(rules: Array<RuleEntry>): Array<string>
        {
            let invalid: Array<string> = []

            for (const rule of rules)
            {
                // 只有前面匹配的规则才做进一步处理
                if (!rule.rule.startsWith(path))
                    continue
    
                // 截取后面的部分，并删除slash方便判断
                let rest = rule.rule.substring(path.length)
                if (rest.startsWith('/'))
                    rest = rest.substring(1)
    
                // 寻找规则中的下一级目录有没有在实际目录中出现，
                // 如果有，直接continue交给子目录渲染时去处理，就不在此处处理
                // 另外： RULE/ （仅带/）和 RULE （连/也不带） 也被视作当前目录下的无效规则
                let restSplit = rest.split('/')
                if (filenames.indexOf(restSplit[0]) != -1)
                    continue
                
                // 已经确认是无效规则
                invalid.push(rule.rule)
            }

            return invalid
        }
        
        // console.log(path)

        return [findInvalid(this.rulesCommon), findInvalid(this.rulesOnce)]
    }

    getFileState(path: string): number
    {
        return this.getFileStateInternal(path)[0]
    }

    setFileState(path: string, state: number)
    {
        let fs = this.getFileStateInternal(path)
        let _state = fs[0]
        let _index = fs[1]

        if (_state == 1 && state != 1)
            this.rulesCommon.splice(_index, 1)
        
        if (_state == 2 && state != 2)
            this.rulesOnce.splice(_index, 1)
        
        if (_state != 1 && state == 1)
            this.rulesCommon.push(new RuleEntry(true, path))
        
        if (_state != 2 && state == 2)
            this.rulesOnce.push(new RuleEntry(true, path))
    }

    toRule(rule: RuleEntry): string
    {
        if (!rule.isRegex)
            return rule.rule

        let p = rule.rule
        for (const e of this.string2chars(this.escapes))
        {
            let escaped = escapeForRegExp(e)
            p = p.replace(new RegExp(escaped, 'g'), escaped)
        }

        return '@' + p
    }

    fromRule(path: string): RuleEntry
    {
        let isRegex = path.startsWith('@')
        
        if (!isRegex)
            return new RuleEntry(false, path)
        
        let p = path.substring(1)
        for (const e of this.string2chars(this.escapes))
        {
            let escaped = escapeForRegExp(escapeForRegExp(e))
            p = p.replace(new RegExp(escaped, 'g'), e)
        }
        return new RuleEntry(true, p)
    }

    toText(): any
    {
        let rulesCommon = this.rulesCommon.map(p => this.toRule(p))
        let rulesOnce = this.rulesOnce.map(p => this.toRule(p))

        let merge = !this.isBalloonServerStandard ? {
            common_mode: rulesCommon,
            once_mode: rulesOnce,
        } : {
            commonMode: rulesCommon,
            onceMode: rulesOnce,
        }
        
        let obj = { ...this.configObject, ...merge }
        return this.isJsonFormat ? JSON.stringify(obj, undefined, 4) : yaml.dump(obj)
    }

    private string2chars(str: string): Array<string>
    {
        let result = []
        for (let i = 0; i < str.length; i++)
            result.push(str[i])
        return result
    }

    private getFileStateInternal(path: string): [number, number]
    {
        let rcIndex = this.rulesCommon.findIndex(p => p.rule == path)
        if (rcIndex != -1)
            return [1, rcIndex]
        
        let roIndex = this.rulesOnce.findIndex(p => p.rule == path)
        if (roIndex != -1)
            return [2, roIndex]
        
        return [0, 0]
    }
}