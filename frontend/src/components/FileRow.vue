<template>
    <div class="file-row" :style="'--indent: '+indent+';'">
        <div class="file-row-info" v-if="!isroot" :type="type()" :state="state()" @click="expand()">
            <div style="min-width: 16px" :style="isDir() ? '' : 'opacity: 0'">
                {{file.expanded ? '▼' : '▶'}}
            </div>
            
            <div class="file-row-filename" :title="file.filename">
                {{file.filename}}{{ isDir() && getRuleCount() > 0 ? (' (' + getRuleCount() + ')') : ''}}
                
            </div>

            <div class="file-row-set-update-method">
                <button type="button" class="file-row-set-update-method-1" :active="getFileState() != 1 ? undefined : ''" @:click="setFileState(1)">普通</button>
                <button type="button" class="file-row-set-update-method-2" :active="getFileState() != 2 ? undefined : ''" @:click="setFileState(2)">补全</button>
                <button type="button" class="file-row-set-update-method-0" :active="getFileState() != 0 ? undefined : ''" @:click="setFileState(0)">忽略</button>
            </div>

            <div class="file-row-modified">
                <div class="file-row-modified-text">{{formatTime(file.modified)}}</div>
            </div>

            <div class="file-row-length">
                {{isDir() ? '' : bytesToSize(file.length)}}
            </div>            
        </div>

        <div class="file-row-files" v-if="this.isroot || file.expanded">
            <file-row
                v-for="f in (file.files as Array<File>)"
                :isroot="false"
                :parent="isroot ? f.filename : (parent + (parent != '' ? '/' : '') + f.filename)"
                :file="f"
                :indent="indent + 1"
            ></file-row>
            
            <div class="file-row-invalid" :title="rule" :mode="isCommon ? 'common' : 'once'" v-for="[rule, isCommon] in getInvalidRules()">
                <span class="file-row-invalid-text">
                    <span class="file-row-invalid-text-short">失效规则: <span style="text-decoration: line-through;">{{shortInvalidRule(rule)}}</span></span>
                    <span class="file-row-invalid-text-long">完整规则: {{rule}}</span>
                </span>
                <button type="button" class="file-row-invalid-remove" @:click="removeRule(rule, isCommon)">移除</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import moment from "moment";
import { defineComponent } from "vue";
import File from "../data/File";
import { bytesToSize } from "../utils";
import prettyBytes from 'pretty-bytes';

export default defineComponent({
    name: 'file-row',
    mounted() {
        // this.file.expanded = this
    },
    data: (() => ({
    })),
    computed: {
        
    },
    methods: {
        state() {
            let s = this.getFileState()
            return this.isDir() ? 
                (this.file.fetching ? 'fetching' : 'fetched') : 
                (s == 0 ? 'none' : (s == 1 ? 'common' : 'once'))
        },
        isDir() {
            return this.file.length < 0
        },
        type() {
            return this.isDir() ? 'dir' : 'file'
        },
        formatTime(time: number) {
            return moment(time * 1000).format('YYYY-MM-DD HH:mm:ss')
        },
        bytesToSize(bytes: number) {
            return prettyBytes(bytes).toUpperCase()
        },
        getFileState () {
            return this.$root.getFileState(this.file)
        },
        setFileState(state: number) {
            this.$root.setFileState(this.file, state)
            this.$forceUpdate()
        },
        removeRule(rule: string, isCommonRule: boolean) {
            this.$root.removeRule(rule, isCommonRule)
            this.$forceUpdate()
        },
        shortInvalidRule(rule: string) {
            let path = this.file.getPath()
            return rule.startsWith(path) ? rule.substring(path.length + (path.length > 0 ? 1 : 0)) : rule
        },
        getRuleCount(): number {
            return this.$root.getRuleCount(this.file.getPath())
        },
        getInvalidRules(): Array<[string, boolean]> {
            if (!this.isDir() || !this.file.isDirectoryFetched())
                return []
            
            let path = this.isroot ? '' : this.file.getPath()
            let filenames = this.file.isDirectoryFetched() ? this.file.files!.map((f: File) => f.filename) : []
            
            let [common, once] = this.$root.getInvalidRules(path, filenames)

            let rules: Array<[string, boolean]> = []

            for (const rule of common)
                rules.push([rule, true])
            
            for (const rule of once) 
                rules.push([rule, false])

            return rules
        },
        expand() {
            if (!this.isDir())
                return
            
            if (!this.file.fetching && !this.file.isDirectoryFetched())
                this.$root.listFiles(this.file).then(() => {
                    this.$forceUpdate()
                })

            this.file.expanded = !this.file.expanded
            this.$forceUpdate()
        },
    },
    props: {
        isroot: { type: Boolean, required: true },
        parent: { type: String, required: true },
        file: { type: File, required: true },
        indent: { type: Number, required: true }
    }
})
</script>

<style lang="stylus" scoped>
.file-row
    display: flex
    flex-direction: column;

    *
        user-select: none

    .file-row-info
        display: flex
        border: solid 1px #00000000;
        padding-left: calc(var(--indent) * 2rem);

        &:hover
            border-color: #444
        
        &[state=common]
            color: #00ffb9;
            // background-color: #3badcf;
            // color: #000;
        
        &[state=once]
            color: #e1e100;
            // background-color: #b5a80f;
            // color: #000;
        
        &[state=none]
            color: #787878;
        
        &[type=file]
            &:hover
                .file-row-modified-text
                    // display: none
                    opacity: 0.5
            
            &:not(:hover)
                .file-row-set-update-method
                    display: none

        &[type=dir]
            .file-row-set-update-method
                display: none
            
            .file-row-modified-text
                color: #787878

        &[state=fetching]
            .file-row-filename
                &::before
                    content: ""
                    animation: loading 1s infinite
                // &::after
                //     content: " (正在获取目录下的文件...)"

        .file-row-filename
            flex-grow: 1
            flex-shrink: 1
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        
        .file-row-set-update-method
            width: 15%
            min-width: 160px
            flex-shrink: 0
            white-space: nowrap;
            margin: 0px 8px
            display: flex
            gap: 14px;
            // margin-left: 6px;
            
            .file-row-set-update-method-0[active]
                background-color: #787878;

            .file-row-set-update-method-1[active]
                background-color: #00ffb9;
            
            .file-row-set-update-method-2[active]
                background-color: #e1e100;
                
        .file-row-modified
            width: 15%
            min-width: 170px
            flex-shrink: 0
            white-space: nowrap;
            position: relative

        .file-row-length
            width: 8%
            min-width: 65px
            flex-shrink: 0
            text-align: right;
            white-space: nowrap;
    
    .file-row-files
        display: flex
        flex-direction: column;

        .file-row-invalid
            padding-left: calc((var(--indent) + 1) * 2rem + 16px);

            .file-row-invalid-text
                margin-right: 1rem

                // .file-row-invalid-text-short

                .file-row-invalid-text-long
                    display: none
            
            .file-row-invalid-remove
                display: none
            
            &[mode=common]
                color: #00a97a;
            
            &[mode=once]
                color: #9b9b03;

            &:hover
                .file-row-invalid-remove
                    display: unset
                
                .file-row-invalid-text-long
                    display: unset
                
                .file-row-invalid-text-short
                    display: none

@keyframes loading
    0%
        content: "| "
    12%
        content: "/ "
    25%
        content: "- "
    37%
        content: "\\ "
    50%
        content: "| "
    62%
        content: "\/ "
    75%
        content: "- "
    87%
        content: "\\ "
    100%
        content: "| "
</style>