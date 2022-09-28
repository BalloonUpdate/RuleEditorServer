<template>
    <div class="app" style="height: 100%">
        <div class="app-operations">
            <button type="button" v-on:click="saveRules()">保存规则</button>
        </div>
        <div class="file-rows">
            <file-row ref="fr"
                :isroot="true"
                :parent="''"
                :file="rootFile"
                :indent="-1"
            ></file-row>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import File from "../data/File";
import FileRow from "./FileRow.vue";

export default defineComponent({
    components: {
        'file-row': FileRow
    },
    mounted() {
    },
    data: (() => ({
        
    })),
    methods: {
    },
    props: {
        rootFile: { type: File, required: true },
        saveRules: { type: Function, required: true }, // () => void
        listFiles: { type: Function, required: true }, // (file: File) => Promise<Array<File>>
        getFileState: { type: Function, required: true }, // (file: File) => number
        setFileState: { type: Function, required: true }, // (file: File, state: number)
        getInvalidRules: { type: Function, required: true }, // (path: string, filenames: Array<string>) => [Array<string>, Array<string>]
        removeRule: { type: Function, required: true }, // (rule: string, isCommonRule: boolean) => void
        getRuleCount: { type: Function, required: true }, // (path: string) => number
    }
})
</script>

<style lang="stylus" scoped>

.app
    display: flex
    flex-direction: column
    // max-width: 1300px;

    .file-rows
        flex-grow: 1
        height: 100%
        overflow: auto;

        & > .file-row
            margin: 0px 12px;
    
    .app-operations
        display: flex
        margin: 1rem 0rem;
        justify-content: center;

</style>