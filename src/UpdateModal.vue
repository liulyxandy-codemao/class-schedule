<script setup lang="ts">
import { Modal, Button } from "ant-design-vue";

import { ref } from "vue";
import Api from "./api.ts";
import { VERSION_CODE } from "./config.ts";
import { openUrl } from "@tauri-apps/plugin-opener";

const updateModal = ref(false)
const forceUpdate = ref(false)
const version = ref("")
const updatelog = ref("")
Api.getLatestVersion().then(data => {
    if (data.versionCode > VERSION_CODE) {
        version.value = data.version
        updatelog.value = data.updatelog
        updateModal.value = true
        if (data.versionCode - VERSION_CODE > 3) {
            forceUpdate.value = true;
        }
    }
})
</script>
<template>
    <Modal :open="updateModal" :closable="false">
        <template #title>
            版本更新
        </template>
        <p>发现新版本：{{ version }}</p>
        <p>{{ updatelog }}</p>
        <b v-if="forceUpdate">当前版本与最新版本落后过多，必须强制更新。</b>
        <br>
        <a href="https://www.yuque.com/liulyxandy/class-schedule/changelog" target="_blank">查看更新日志</a>
        <br>
        <a href="https://www.yuque.com/liulyxandy/class-schedule/upgrade" target="_blank">如何更新？</a>
        <template #footer>
            <Button @click="updateModal = false" :disabled="forceUpdate">暂时忽略</Button>
            <Button @click="openUrl('https://cs.liulyxandy.cn')">前往下载</Button>
        </template>
    </Modal>
</template>