<script setup lang="ts">
import { Modal, Form, FormItem, Input, Button } from 'ant-design-vue';
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
    configStore.$patch({
        api: configData.value
    });
    await configStore.saveConfig()
    modalsStore.settings = false;
    location.reload()
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