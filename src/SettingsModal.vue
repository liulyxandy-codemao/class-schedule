<script setup lang="ts">
import { Modal, Form, FormItem, Input, Button, notification } from 'ant-design-vue';
import { ref, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useConfigStore, useModalsStore } from './store.ts';
const configStore = useConfigStore();
const modalsStore = useModalsStore();
const { settings } = storeToRefs(modalsStore);

const configData = ref({
    baseurl: configStore.api.baseurl,
    classid: configStore.api.classid
})

const unsubSettings = configStore.$subscribe((_, state) => {
    configData.value.baseurl = state.api.baseurl;
    configData.value.classid = state.api.classid;
})

onUnmounted(() => {
    unsubSettings();
})

const saveConfig = async () => {
    try {
        configStore.$patch({
            api: configData.value
        });
        await configStore.saveConfig();
    } catch (err) {
        console.error("保存配置失败:", err);
        notification.error({
            message: "配置保存失败",
            description: "请检查磁盘空间和权限。",
        });
        return;
    }
    modalsStore.settings = false;
    location.reload();
}

</script>
<template>
    <Modal title="高级设置" :open="settings" :footer="null" @cancel="modalsStore.settings = false">
        <Form layout="vertical">
            <FormItem label="API 根节点">
                <Input v-model:value="configData.baseurl" />
            </FormItem>
            <FormItem label="班级ID">
                <Input v-model:value="configData.classid" />
            </FormItem>
            <FormItem>
                <Button @click="saveConfig">保存</Button>
            </FormItem>
        </Form>
    </Modal>
</template>