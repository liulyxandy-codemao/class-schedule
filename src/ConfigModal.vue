<script setup lang="ts">
import { Modal, Form, FormItem, Input, Button, Switch, Slider, notification } from 'ant-design-vue';
import SettingsModal from './SettingsModal.vue';
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useConfigStore, useModalsStore } from './store.ts';
import { enable, disable, isEnabled } from '@tauri-apps/plugin-autostart';
const configStore = useConfigStore();
const modalsStore = useModalsStore();
const { config } = storeToRefs(modalsStore);
const configData = storeToRefs(configStore);
const autostart = ref(false);

// 缩放级别计算属性
const zoomLevel = computed({
    get: () => configData.ui.value.zoomLevel,
    set: (value) => {
        configStore.ui.zoomLevel = value;
        // 立即应用CSS缩放
        document.documentElement.style.zoom = value.toString();
    }
});

const saveConfig = async () => {
    try {
        await configStore.saveConfig();
    } catch (err) {
        console.error("保存配置失败:", err);
        notification.error({
            message: "保存配置失败",
            description: "请检查磁盘空间和权限。",
        });
        return;
    }
    try {
        if (autostart.value) {
            await enable();
        } else {
            await disable();
        }
    } catch (err) {
        console.warn("设置自启动失败:", err);
    }
    modalsStore.toggleconfig();
}

isEnabled().then((enabled) => {
    autostart.value = enabled;
}).catch((err) => {
    console.warn("检查自启动状态失败:", err);
})

</script>
<template>
    <Modal title="配置课表" :open="config" :footer="null" @cancel="saveConfig">
        <Form layout="vertical">
            <FormItem label="字号">
                <Input v-model:value="configData.ui.value.fontSize" type="number" />
            </FormItem>
            <FormItem label="显示缩放">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <Slider 
                        v-model:value="zoomLevel" 
                        :min="0.7" 
                        :max="1.5" 
                        :step="0.1" 
                        style="flex: 1;"
                        :tooltip-formatter="(value: number) => `${Math.round(value * 100)}%`"
                    />
                    <span style="min-width: 40px; text-align: center; font-weight: bold;">
                        {{ Math.round(zoomLevel * 100) }}%
                    </span>
                </div>
            </FormItem>
            <FormItem label="自动启动">
                <Switch v-model:checked="autostart" />
            </FormItem>
            <FormItem label="关闭背景透明度">
                <Switch v-model:checked="configData.ui.value.disableBackgroundTransparency" />
            </FormItem>
        </Form>
        <Button type="dashed" @click="modalsStore.settings = true">高级设置</Button>
    </Modal>
    <SettingsModal />
</template>