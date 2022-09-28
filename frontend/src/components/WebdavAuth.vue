<template>
    <div id="auth-dialog" class="auth-form" v-bind:style="headbarStyle(380, 250)" v-show="windowVisible" >
        <div class="auth-title-bar" v-on:mousedown="onMouseDown" v-on:mouseup="onMouseUp" v-on:mousemove="onMouseMove">登录系统（Webdav）</div>
        <div>
            <div style="display: flex">
                <label class="auth-label">主机地址</label>
                <input v-model="server" type="text" class="auth-input auth-font" autocomplete="off" spellcheck="false" style="flex-grow: 1" />
            </div>

            <div style="display: flex">
                <label class="auth-label">基本路径</label>
                <input v-model="basepath" type="text" class="auth-input auth-font" autocomplete="off" spellcheck="false" style="flex-grow: 1" />
            </div>

            <div style="display: flex">
                <label class="auth-label">用户</label>
                <input v-model="username" type="text" class="auth-input auth-font" autocomplete="off" spellcheck="false" />
            </div>
                
            <div style="display: flex">
                <label class="auth-label">密码</label>
                <input v-model="password" type="password" class="auth-input auth-font" autocomplete="off" spellcheck="false" />
            </div>
        </div>
        
        <button type="button" class="auth-actions-close button" v-on:click="onClickEmpty()">清空</button>

        <div style="float: right">
            <button class="auth-actions-close button" v-on:click="hide()">关闭</button>
            <button class="auth-actions-save button" v-on:click="onClickSave()">保存</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useDrag from './composables/useDrag'
import useFloatingWindow from './composables/useFloatingWindow'

export default defineComponent({
    name: 'WebdavAuth',
    setup () {
        return {
            ...useDrag(),
            ...useFloatingWindow(false)
        }
    },
    props: {
        onClickSave: { type: Function, required: true }, // () => void
        onClickEmpty: { type: Function, required: true }, // () => void
    },
    data: () => ({
        server: '', 
        basepath: '', 
        username: '', 
        password: '', 
    })
})
</script>

<style lang="stylus" scoped>
    .auth-form
        z-index: 10
        padding: 4px;
        border: 1px solid
        position: absolute
        background: #f6f6f6
        color: #666

        .auth-title-bar
            height: 32px

    .auth-input
        display: inline-block
        height: 35px
        padding: 0px 8px
        margin-left: 8px
        width: 283px
        color: #999 !important
        font-size: 1rem
        flex: 1

    .auth-label
        padding: 7px 0 15px 5px
        margin: 0 0 2px
        display: inline-block
        width: 5rem
    
    #auth-actions-login
        transition: background-color 0.6s
    
    .auth-font
        font-family: "Consolas", "微软雅黑", 'Open Sans', 'Helvetica', 'Tahoma, Arial', 'Hiragino Sans GB', "Microsoft YaHei", "Micro Hei", 'SimSun', "宋体", 'Heiti', "黑体", 'sans-serif' !important
</style>