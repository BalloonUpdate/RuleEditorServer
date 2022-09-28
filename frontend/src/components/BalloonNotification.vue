<template>
    <transition-group name="message-box" tag="div" 
        class="messages-container" 
        v-bind:length="messages.length"
    >
        <div class="message-object"
            v-for="msg in messages"
            v-bind:id="msg.id"
            v-bind:key="msg.id"
            v-on:click="removeMessage(msg.id)"
        >
            <div class="message-object-text" v-html="msg.text"></div>
        </div>
    </transition-group>
</template>

<script lang="ts">
import { defineComponent } from "vue"

interface MessageObject
{
    id: string
    text: string
    duration: number
}

let num = 0

export default defineComponent({
    name: 'BalloonNotification',
    data: () => ({
        messages: [] as Array<MessageObject>
    }),
    methods: {
        addMessage: function(text: string, duration = 2000) {
            let rid = 'bubble-' + (num++)
            this.messages.push({
                id: rid,
                text: text.replace(/\n/g, '<br/>'),
                duration: duration / 1000
            })
            setTimeout(() => this.removeMessage(rid), duration)

            // 更新max-height属性
            setTimeout(() => this.updateDomProperties(rid), 1000);

            return rid
        },
        removeMessage(rid: string) {
            this.messages = this.messages.filter((e: MessageObject) => e.id != rid)
        },
        updateDomProperties(id: string) {
            let e = document.querySelector('#'+id) as HTMLElement
            let height = e.scrollHeight;
            e.style.setProperty('--dom-height', height + 'px')
            e.style.setProperty('--dom-width', e.scrollWidth+'px')
        }
    }
})
</script>

<style lang="stylus">
    .messages-container
        position: fixed
        right: 4%
        top: 40px
        text-align: left
        z-index: 1000000000
        display: flex
        flex-direction: column-reverse
        align-items: flex-end
        max-height: calc(100vh - 80px)
    
    .message-object
        max-width: calc(90vw - 4%)
        width: fit-content
        border-radius: 5px
        margin: 0.4rem 0rem
        padding: 0.8rem 1rem
        background-color: #008b53
        cursor: pointer
        max-height: var(--dom-height)

        .message-object-text
            font-size: 16px
            font-weight: normal
            color: #fff
            overflow-wrap: break-word
            user-select: none
    
    .message-box-enter-active, .message-box-leave-active
        transition: all 0.2s ease

    .message-box-enter-from, .message-box-leave-to
        opacity: 0
        transform: translateX(var(--dom-width)) scaleY(0)
        padding-top: 0px
        padding-bottom: 0px
        margin-top: 0px
        margin-bottom: 0px
    
    .message-box-enter-from
        transform: translateY(-30px)
    
    .message-box-leave-to
        transform: translateX(var(--dom-width)) scaleY(0)
        max-height: 0px !important

    // .message-box-leave-active
    //     position: absolute
    
</style>