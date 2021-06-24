Vue.component('loading', {
    data: function () {
        return {
            showImg: true
        }
    },
    created() {
        let state = false;
        if (this.timer) {
            clearInterval(this.timer);
        } else {
            this.timer = setInterval(() => {
                this.showImg = state;
                state = !state;
            }, 500);
        }
    },
    destroyed() {
        clearInterval(this.timer);
    },
    template: '<transition name="fade"><div id="start_image" v-show="showImg"><el-image src="./src/static/img/habitica.png" fit="contain"></el-image></div></transition>'
});

new Vue({
    el: '#app',
    data: {
        isLoading: true,
        dialog: false,
        userForm: {user: '', key: ''},
        userAvatarImg: "",
        name: "",
        username: "",
        level: 0,
        HP: 0,
        EXP: 0,
        maxEXP: 0,
        MP: 0,
        maxMP: 0,
        menuVal: 1,
        habitList: [],
        dailyList: [],
        todoList: [],
        undoneList: [],
        createInput: ''
    },
    methods: {
        onRegistered() {openBrowser("https://habitica.com/static/home");},
        onLogin() {this.dialog = false;},
        doNone() {return false;},
        showErrMsg(msg) {
            let that = this;
            setTimeout(function () {that.$message.error(msg);}, 200);
        },
        loginHabitica() {
            let user = this.userForm.user;
            let key = this.userForm.key;
            if (user.trim().length <= 0 || key.trim().length <= 0) {
                this.dialog = true;
                this.showErrMsg('请输入你的凭证');
                return;
            }
            headers["x-api-user"] = user;
            headers["x-api-key"] = key;
            getHBUserInfo((success, data) => {
                if (success) {
                    this.refreshData(data);
                    saveToDB(DB_KEY_USER_INFO, this.userForm.key + DB_KEY_SPLIT + this.userForm.user);
                    this.userForm.key = '';
                    this.userForm.user = '';
                    this.isLoading = false;
                    this.menuVal = 1;
                } else {
                    this.dialog = true;
                    this.showErrMsg(data === 429 ? '登录频繁，休息一会' : '登录失败，' + data);
                }
            });
        },
        isNotLogin() {
            if (!headers["x-api-user"]) {
                const userInfo = getFromDB(DB_KEY_USER_INFO);
                if (!userInfo) {
                    return true;
                }
                let values = userInfo.split(DB_KEY_SPLIT);
                headers["x-api-user"] = values[1];
                headers["x-api-key"] = values[0];
            }
            return false;
        },
        onSynchronousData() {
            if (this.isNotLogin()) {
                this.dialog = true;
                return;
            }
            getHBUserInfo((success, data) => {
                if (success) {
                    this.refreshData(data);
                } else {
                    if (data === 429) {
                        this.showErrMsg('操作频繁，休息一会');
                    } else {
                        this.dialog = true;
                        this.showErrMsg('失去同步，' + data);
                    }
                }
            });
        },
        refreshData(userInfo) {
            this.name = userInfo.profile.name;
            this.username = userInfo.auth.local.username;
            this.level = userInfo.stats.lvl;
            let hp = userInfo.stats.hp;
            if (hp <= 0) {
                this.HP = 0;
                this.openHabitica();
            } else {
                this.HP = hp;
            }
            this.EXP = userInfo.stats.exp;
            this.maxEXP = userInfo.stats.toNextLevel;
            this.MP = userInfo.stats.mp;
            this.maxMP = userInfo.stats.maxMP;
            this.userAvatarImg = "./src/static/svg/" + userInfo.stats.class + ".svg";
            this.isLoading = false;
            getHBHabit((tasks) =>{
                if (tasks == null) {
                    this.showErrMsg('失去同步');
                    return;
                }
                this.habitList = [];
                this.dailyList = [];
                this.todoList = [];
                this.undoneList = [];
                for (let i = 0; i < tasks.length ; ++i) {
                    let task = tasks[i];
                    if (task.type === "habit") {
                        this.habitList.push({
                            id: task.id,
                            text: task.text,
                            notes: task.notes,
                            color: getColorByValue(task.value),
                            up: task.up,
                            down: task.down,
                            counterUp: task.counterUp,
                            counterDown: task.counterDown
                        });
                    }else if (task.type === "daily") {
                        this.dailyList.push({
                            id: task.id,
                            text: task.text,
                            notes: task.notes,
                            color: getColorByValue(task.value),
                            completed: task.completed,
                            isDue: task.isDue,
                            collapseChecklist: task.collapseChecklist,
                            checklist: task.checklist,
                            yesterDaily: task.yesterDaily,
                        });
                    }else if (task.type === "todo") {
                        this.todoList.push({
                            id: task.id,
                            text: task.text,
                            notes: task.notes,
                            color: getColorByValue(task.value),
                            completed : task.completed,
                            collapseChecklist: task.collapseChecklist,
                            checklist: task.checklist
                        });
                    }
                }
                let lastStartTime = new Date(userInfo.auth.timestamps.loggedin);
                lastStartTime.setHours(userInfo.preferences.dayStart);
                lastStartTime.setMinutes(0);
                lastStartTime.setSeconds(0);
                lastStartTime.setMilliseconds(0);
                let todayCron = new Date();
                todayCron.setHours(userInfo.preferences.dayStart);
                todayCron.setMinutes(0);
                todayCron.setSeconds(0);
                todayCron.setMilliseconds(0);
                if (new Date() >= lastStartTime && new Date(userInfo.lastCron) < todayCron) {
                    for (let i = 0; i < this.dailyList.length; ++i) {
                        if (this.dailyList[i].isDue && !this.dailyList[i].completed) {
                            this.undoneList.push(this.dailyList[i]);
                        }
                    }
                }
                this.$message({message: '同步成功', center: true, type: 'success', duration: 1000, offset: 70});
            });
        },
        onLogout() {
            this.isLoading = true;
            headers["x-api-user"] = '';
            headers["x-api-key"] = '';
            delInDB(DB_KEY_USER_INFO);
            this.dialog = true;
        },
        openHabitica() {openBrowser("https://habitica.com");},
        formatHP(percentage) {return ~~this.HP;},
        formatEXP(percentage) {return ~~this.EXP;},
        formatMP(percentage) {return ~~this.MP;},
        changeCollapseIcon(id, collapseChecklist) {updateHBTask(id, {"collapseChecklist": collapseChecklist});},
        scoreTask(task, direction, menuVal) {
            if (menuVal === 1) {
                if ((direction === 'up' && !task.up) || (direction === 'down' && !task.down)) {
                    return;
                }
            }
            scoreHBTask(task.id, direction, async (success, data) => {
                if (success) {
                    if (menuVal === 1) {
                        direction === 'up' ? task.counterUp++ : task.counterDown++;
                    } else {
                        task.completed = !task.completed;
                    }
                    let hp = data.hp;
                    if (hp < this.HP) {
                        await this.$notify({message: '生命：-' + (this.HP - hp).toFixed(2), position: 'bottom-left', type: 'warning', duration: 2000});
                    }
                    if (hp <= 0) {
                        this.HP = 0;
                        this.openHabitica();
                    } else {
                        this.HP = hp;
                    }
                    if (data.lvl > this.level) {
                        await this.$notify({message: '经验：+' + (this.maxEXP - this.EXP + data.exp).toFixed(2), position: 'bottom-left', type: 'success', duration: 2000});
                        await this.$notify({message: '升级了！', position: 'bottom-left', type: 'success', duration: 2000});
                    } else if (data.exp < this.EXP) {
                        await this.$notify({message: '经验：-' + (this.EXP - data.exp).toFixed(2), position: 'bottom-left', type: 'warning', duration: 2000});
                    } else if (data.exp > this.EXP){
                        await this.$notify({message: '经验：+' + (data.exp - this.EXP).toFixed(2), position: 'bottom-left', type: 'success', duration: 2000});
                    }
                    if (data.mp < this.MP) {
                        await this.$notify({message: '魔法：-' + (this.MP - data.mp).toFixed(2), position: 'bottom-left', type: 'warning', duration: 2000});
                    } else if (data.mp > this.MP){
                        await this.$notify({message: '魔法：+' + (data.mp - this.MP).toFixed(2), position: 'bottom-left', type: 'success', duration: 2000});
                    }
                    this.level = data.lvl;
                    this.EXP = data.exp;
                    this.MP = data.mp;
                } else {
                    this.showErrMsg(data === 429 ? '操作频繁，休息一会' : '失去同步，' + data);
                }
            });
        },
        scoreCheckList(taskId, checkListId) {scoreHBCheckList(taskId, checkListId);},
        create() {
            let type = this.menuVal === 1 ? "habit" : this.menuVal === 2 ? "daily" : this.menuVal === 3 ? "todo" : "";
            createTask(this.createInput, type, (success) => {
                if (success) {
                    this.createInput = '';
                } else {
                    this.showErrMsg('失去同步');
                }
                this.onSynchronousData();
            });
        },
        completedYesterday() {
            let doneList = [];
            for (let i = 0; i < this.undoneList.length; ++i) {
                let task = this.undoneList[i];
                if (task.completed) {
                    doneList.push({id: task.id, direction: "up"});
                }
            }
            if (doneList.length > 0) {
                bulkUpScore(doneList);
            }
            cronTask((success) => {
                if (success) {
                    this.undoneList = [];
                    this.onSynchronousData();
                } else {
                    this.showErrMsg('失去同步');
                }
            });
        }
    },
    mounted() {utools.onPluginEnter(() => this.onSynchronousData());},
    filters: {
        ellipsisName: function(value) {
            if (!value) return '';
            if (/^[A-Za-z0-9]+$/.test(value)) {
                return value.length < 15 ? value : value.slice(0, 13) + '...';
            } else {
                return value.length < 8 ? value : value.slice(0, 6) + '...';
            }
        },
        ellipsisUserName: function (value) {
            if (!value) return '';
            if (value.length < 8) return value;
            return value.slice(0, 7) + '...';
        }
    }
});