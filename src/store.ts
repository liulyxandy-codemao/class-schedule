import { defineStore } from 'pinia'
import { Config } from './config'
import * as fs from '@tauri-apps/plugin-fs'
import { notification } from 'ant-design-vue'
import Api, { ApiRespData } from './api.ts'

export const useConfigStore = defineStore('config', {
    state: (): Config => {
        return {
            ui: {
                fontSize: '28',
                zoomLevel: 1.0,
                disableBackgroundTransparency: false
            },
            api: {
                classid: '202301',
                baseurl: 'https://backend-cs.liulyxandy.cn'
            }
        }
    },
    actions: {
        async hasConfig() {
            return await fs.exists('config.json', {baseDir: fs.BaseDirectory.AppConfig});
        },
        async readConfig() {
            try {
                const raw = await fs.readTextFile('config.json', {baseDir: fs.BaseDirectory.AppConfig});
                const configData = JSON.parse(raw);
                this.$patch(configData);
            } catch (err) {
                console.error("读取配置失败，使用默认配置:", err);
                notification.warning({
                    message: "配置读取失败",
                    description: "已使用默认配置，部分设置可能丢失。",
                });
            }
        },
        async saveConfig() {
            try {
                if (!(await this.hasConfig())) {
                    await fs.mkdir('', {baseDir: fs.BaseDirectory.AppConfig});
                    await fs.create('config.json', {baseDir: fs.BaseDirectory.AppConfig});
                }
                await fs.writeTextFile('config.json', JSON.stringify(this.$state), {baseDir: fs.BaseDirectory.AppConfig});
            } catch (err) {
                console.error("保存配置失败:", err);
                notification.error({
                    message: "配置保存失败",
                    description: "请检查磁盘空间和权限。",
                });
            }
        },
        async setConfig(state: Config) {
            this.$patch(state);
            await this.saveConfig();
        }
    }
})

export const useScheduleStore = defineStore('schedule', {
    state: () => ({
        schedule: [] as string[],
        timetable: [] as ApiRespData.TimeTable
    }),
    actions: {
        async fetchSchedule(api: Api) {
            const modalsStore = useModalsStore();
            modalsStore.dataStatus = 'fetching';
            if (modalsStore.dataType === 'local') {
                try {
                    if (!(await fs.exists('backup.schedule.json', {baseDir: fs.BaseDirectory.AppConfig})) || !(await fs.exists('backup.timetable.json', {baseDir: fs.BaseDirectory.AppConfig}))) {
                        modalsStore.dataStatus = 'error';
                        return;
                    }
                    let day = new Date().getDay();
                    day = day == 0 ? 6 : day - 1;
                    this.schedule = JSON.parse(await fs.readTextFile('backup.schedule.json', {baseDir: fs.BaseDirectory.AppConfig}))[day];
                    this.timetable = JSON.parse(await fs.readTextFile('backup.timetable.json', {baseDir: fs.BaseDirectory.AppConfig}));
                    modalsStore.dataStatus = 'success';
                } catch (err) {
                    console.error("读取本地备份失败:", err);
                    modalsStore.dataStatus = 'error';
                    notification.error({
                        message: "读取本地缓存失败",
                        description: "请切换到云端模式获取数据。",
                    });
                }
            } else {
                try {
                    let day = new Date().getDay();
                    day = day == 0 ? 6 : day - 1;
                    let schedule = await api.getSchedule();
                    this.schedule = schedule[day];
                    this.timetable = await api.getTimeTable();
                    try {
                        if (!(await fs.exists('backup.schedule.json', {baseDir: fs.BaseDirectory.AppConfig}))){
                            await fs.create('backup.schedule.json', {baseDir: fs.BaseDirectory.AppConfig});
                        }
                        if (!(await fs.exists('backup.timetable.json', {baseDir: fs.BaseDirectory.AppConfig}))){
                            await fs.create('backup.timetable.json', {baseDir: fs.BaseDirectory.AppConfig});
                        }
                        await fs.writeTextFile('backup.schedule.json', JSON.stringify(schedule), {baseDir: fs.BaseDirectory.AppConfig});
                        await fs.writeTextFile('backup.timetable.json', JSON.stringify(this.timetable), {baseDir: fs.BaseDirectory.AppConfig});
                    } catch (err) {
                        console.warn("保存本地备份失败:", err);
                    }
                    modalsStore.dataStatus = 'success';
                } catch (err) {
                    console.error("获取云端数据失败:", err);
                    modalsStore.dataStatus = 'error';
                    notification.error({
                        message: "获取课表数据失败",
                        description: "请检查网络连接和 API 设置。",
                    });
                }
            }
        }
    }
})

export const useModalsStore = defineStore('modals', {
    state: () => {
        return {
            config: false,
            dataType: 'cloud',
            dataStatus: 'fetching',
            settings: false
        }
    },
    actions: {
        toggleconfig() {
            this.config = !this.config
        }
    }
})