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
        loginDialog: false,
        userForm: {user: "", key: ""},
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
        selectTag: 0,
        conservedTag: [0,4,7,10],
        dynamicTags: [{index: 1, name: "全 部"}, {index: 2, name: "偶 尔"}, {index: 3, name: "经 常"}],
        habitList: [],
        dailyList: [],
        todoList: [],
        undoneList: [],
        showTaskList: [],
        createInput: "",
        requestLock: false,
        taskDetailDialog: false,
        taskDetails: {
            id: "",
            text: "",
            notes: "",
            up: true,
            down: false,
            priority: "",
            frequency: "",
            counterUp: 0,
            counterDown: 0,
            checklist: [],
            newInputCheckList: "",
            startDate: "",
            everyX: 0,
            repeat: {"m": true, "t": true, "w": true, "th": true, "f": true, "s": true, "su": true},
            streak: 0,
            date: ""
        },
        pickerOptions: {
            shortcuts: [{
                text: '昨天',
                onClick(picker) {
                    const date = new Date();
                    date.setTime(date.getTime() - 3600 * 1000 * 24);
                    picker.$emit('pick', date);
                }
            }, {
                text: '今天',
                onClick(picker) {
                    picker.$emit('pick', new Date());
                }
            }, {
                text: '明天',
                onClick(picker) {
                    const date = new Date();
                    date.setTime(date.getTime() + 3600 * 1000 * 24);
                    picker.$emit('pick', date);
                }
            }]
        },
        partyId: "",
        partyMembers: 0,
        partyQuest: {
            active: false,
            joinMembers: 0,
            key: "",
            isAccept: false,
            haveHP: true,
            schedule: 0
        },
        partyChat: []
    },
    methods: {
        onRegistered() {openBrowser("https://habitica.com/static/home");},
        doNone() {return false;},
        showErrMsg(msg) {
            let showMsg = !msg ? "失去同步" : msg === 429 ? "操作频繁，休息一会" : msg === 400 ? "提交内容有误" : msg === 401 ? "不允许的操作" : "失去同步，" + msg;
            let that = this;
            setTimeout(function () {that.$message.error(showMsg);}, 200);
        },
        loginHabitica() {
            let user = this.userForm.user;
            let key = this.userForm.key;
            if (user.trim().length <= 0 || key.trim().length <= 0) {
                this.loginDialog = true;
                this.showErrMsg("请输入你的凭证");
                return;
            }
            headers["x-api-user"] = user;
            headers["x-api-key"] = key;
            getHBUserInfo((success, data) => {
                if (success) {
                    this.refreshData(data);
                    saveToDB(DB_KEY_USER_INFO, window.btoa(this.userForm.key + DB_KEY_SPLIT + this.userForm.user));
                    this.userForm.key = '';
                    this.userForm.user = '';
                    this.isLoading = false;
                } else {
                    this.loginDialog = true;
                    this.showErrMsg(data + " 校验失败");
                }
            });
        },
        isNotLogin() {
            if (!headers["x-api-user"]) {
                const userInfo = getFromDB(DB_KEY_USER_INFO);
                if (!userInfo) {
                    return true;
                }
                let values = window.atob(userInfo).split(DB_KEY_SPLIT);
                headers["x-api-user"] = values[1];
                headers["x-api-key"] = values[0];
            }
            return false;
        },
        onSynchronousData() {
            if (this.isNotLogin()) {
                this.loginDialog = true;
                return;
            }
            getHBUserInfo((success, data) => {
                if (success) {
                    this.refreshData(data);
                } else {
                    if (data !== 429) {
                        this.onLogout();
                    }
                    this.showErrMsg(data);
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
            this.partyId = userInfo.party._id;
            this.isLoading = false;
            getHBHabit((tasks) =>{
                if (tasks == null) {
                    this.showErrMsg();
                    return;
                }
                this.habitList = [];
                this.dailyList = [];
                this.todoList = [];
                this.undoneList = [];
                let now = new Date();
                for (let i = 0; i < tasks.length ; ++i) {
                    let task = tasks[i];
                    if (task.type === "habit") {
                        this.habitList.push({
                            id: task.id,
                            text: task.text,
                            notes: task.notes,
                            value: task.value,
                            color: getColorByValue(task.value),
                            up: task.up,
                            down: task.down,
                            counterUp: task.counterUp,
                            counterDown: task.counterDown,
                            priority: String(task.priority),
                            frequency: task.frequency
                        });
                    }else if (task.type === "daily") {
                        this.dailyList.push({
                            id: task.id,
                            text: task.text,
                            notes: task.notes,
                            color: getColorByValue(task.value),
                            completed: task.completed,
                            isDue: task.isDue,
                            repeat: task.repeat,
                            everyX: task.everyX,
                            collapseChecklist: task.collapseChecklist,
                            checklist: task.checklist,
                            priority: String(task.priority),
                            frequency: task.frequency,
                            startDate: task.startDate,
                            streak: task.streak,
                            nextDue: task.nextDue
                        });
                    }else if (task.type === "todo") {
                        this.todoList.push({
                            id: task.id,
                            text: task.text,
                            notes: task.notes,
                            color: getColorByValue(task.value),
                            completed : task.completed,
                            collapseChecklist: task.collapseChecklist,
                            checklist: task.checklist,
                            date: task.date,
                            dateMsg: getDateReminder(now, task.date),
                            priority: String(task.priority),
                        });
                    }
                }
                this.setDefaultTag(0);
                let lastCron = new Date(userInfo.lastCron);
                let dateCron = new Date();
                dateCron.setHours(userInfo.preferences.dayStart);
                dateCron.setMinutes(0);
                dateCron.setSeconds(0);
                dateCron.setMilliseconds(0);
                let shouldCron = false;
                let isNextDay = true;
                if (lastCron < dateCron) {
                    let nextCron = new Date(userInfo.lastCron);
                    nextCron.setHours(userInfo.preferences.dayStart);
                    nextCron.setMinutes(0);
                    nextCron.setSeconds(0);
                    nextCron.setMilliseconds(0);
                    if ((now.getTime() - (nextCron.getTime() + 1000 * 60 * 60 * 24)) / 1000 / 60 / 60 < 24) {
                        if (dateCron <= now) {
                            shouldCron = true;
                        }
                    } else {
                        shouldCron = true;
                        isNextDay = false;
                    }
                }
                if (shouldCron) {
                    const weekDay = ["su", "m", "t", "w", "th", "f", "s"];
                    dateCron.setDate(dateCron.getDate() - 1);
                    let index = weekDay[dateCron.getDay()];
                    for (let i = 0; i < this.dailyList.length; ++i) {
                        let daily = this.dailyList[i];
                        if (daily.completed || now.getTime() < new Date(daily.startDate).getTime()) {
                            continue;
                        }
                        if (isNextDay) {
                            if (daily.isDue) {
                                this.undoneList.push(daily);
                            }
                        } else {
                            let dueDays = daily.nextDue;
                            for (let j = 0; j <= dueDays.length; ++j) {
                                if (j === dueDays.length) {
                                    if (new Date(dueDays[j - 1]) > dateCron) {
                                        break;
                                    }
                                    if (daily.frequency === "daily") {
                                        if (daily.everyX === 1) {
                                            this.undoneList.push(daily);
                                            break;
                                        } else {
                                            let calcDate = new Date(dueDays[j - 1]);
                                            for (let k = 0; k <= 100; ++k) {
                                                if (dateCron.toLocaleDateString() === calcDate.toLocaleDateString() || k === 100) {
                                                    this.undoneList.push(daily);
                                                    break;
                                                }
                                                if (calcDate >  dateCron) break;
                                                calcDate.setDate(calcDate.getDate() + daily.everyX);
                                            }
                                        }
                                    } else if (daily.frequency === "weekly") {
                                        if (daily.everyX === 1 && daily.repeat[index]) {
                                            this.undoneList.push(daily);
                                            break;
                                        } else {
                                            let calcDate = new Date(dueDays[j - 1]);
                                            for (let k = 0; k <= 14; ++k) {
                                                if (dateCron.toLocaleDateString() === calcDate.toLocaleDateString() || k === 14) {
                                                    this.undoneList.push(daily);
                                                    break;
                                                }
                                                if (calcDate >  dateCron) break;
                                                calcDate.setDate(calcDate.getDate() + (daily.everyX * 7));
                                            }
                                        }
                                    } else if (daily.frequency === "monthly") {
                                        if (!daily.daysOfMonth && !daily.weeksOfMonth) {
                                            let calcDate = new Date(daily.startDate);
                                            calcDate.setMonth(calcDate.getMonth() + daily.everyX);
                                            if (dateCron.toLocaleDateString() === calcDate.toLocaleDateString()) {
                                                this.undoneList.push(daily);
                                                break;
                                            }
                                        } else {
                                            this.undoneList.push(daily);
                                            break;
                                        }
                                    } else {
                                        this.undoneList.push(daily);
                                        break;
                                    }
                                } else if (dateCron.toLocaleDateString() === new Date(dueDays[j]).toLocaleDateString()) {
                                    this.undoneList.push(daily);
                                    break;
                                }
                            }
                        }
                    }
                    if (this.undoneList.length <= 0) {
                        cronTask((success) => {
                            success ? this.onSynchronousData() : this.openHabitica();
                        });
                    }
                }
                this.$message({message: '同步完成', center: true, type: 'success', duration: 1000, offset: 70});
            });
        },
        onLogout() {
            this.isLoading = true;
            this.menuVal = 1;
            headers["x-api-user"] = '';
            headers["x-api-key"] = '';
            delInDB(DB_KEY_USER_INFO);
            delInDB(DB_KEY_TAG_SETTING);
            this.loginDialog = true;
        },
        openHabitica() {openBrowser("https://habitica.com");},
        formatHP(percentage) {return ~~this.HP;},
        formatEXP(percentage) {return ~~this.EXP;},
        formatMP(percentage) {return ~~this.MP;},
        changeCollapseIcon(id, collapseChecklist) {updateHBTask(id, {"collapseChecklist": collapseChecklist},()=>{});},
        scoreTask(task, direction) {
            if (this.requestLock) {
                return;
            }
            this.requestLock = true;
            let menuVal = this.menuVal;
            if (menuVal === 1 && ((direction === 'up' && !task.up) || (direction === 'down' && !task.down))) {
                return;
            }
            scoreHBTask(task.id, direction, async (success, data) => {
                if (success) {
                    let selectTag = this.selectTag;
                    if (menuVal === 1) {
                        direction === 'up' ? task.counterUp++ : task.counterDown++;
                        task.value += data.delta;
                        task.color = getColorByValue(task.value);
                        if ((selectTag === 2 && task.value >= 1) || (selectTag === 3 && task.value < 1)) {
                            this.selectTag = 0;
                        }
                    } else {
                        if (selectTag === 9) {
                            this.todoList.push(task);
                        }
                        task.completed = !task.completed;
                        task.color = getColorByValue(task.value);
                        this.selectTag = 0;
                    }

                    let hp = data.hp;
                    if (hp < this.HP) {
                        await this.$notify({message: '生命：-' + (this.HP - hp).toFixed(2), position: 'bottom-left', type: 'warning', duration: 2000, offset:70});
                    }
                    if (hp <= 0) {
                        this.HP = 0;
                        this.openHabitica();
                    } else {
                        this.HP = hp;
                    }
                    if (data.lvl > this.level) {
                        await this.$notify({message: '经验：+' + (this.maxEXP - this.EXP + data.exp).toFixed(2), position: 'bottom-left', type: 'success', duration: 2000, offset:70});
                        await this.$notify({message: '升级了！', position: 'bottom-left', type: 'success', duration: 2000, offset:70});
                    } else if (data.exp < this.EXP) {
                        await this.$notify({message: '经验：-' + (this.EXP - data.exp).toFixed(2), position: 'bottom-left', type: 'warning', duration: 2000, offset:70});
                    } else if (data.exp > this.EXP){
                        await this.$notify({message: '经验：+' + (data.exp - this.EXP).toFixed(2), position: 'bottom-left', type: 'success', duration: 2000, offset:70});
                    }
                    if (data.mp < this.MP) {
                        await this.$notify({message: '魔法：-' + (this.MP - data.mp).toFixed(2), position: 'bottom-left', type: 'warning', duration: 2000, offset:70});
                    } else if (data.mp > this.MP){
                        await this.$notify({message: '魔法：+' + (data.mp - this.MP).toFixed(2), position: 'bottom-left', type: 'success', duration: 2000, offset:70});
                    }
                    this.level = data.lvl;
                    this.EXP = data.exp;
                    this.MP = data.mp;
                } else {
                    this.showErrMsg(data);
                }
                this.requestLock = false;
            });
        },
        scoreCheckList(taskId, checkListId) {scoreHBCheckList(taskId, checkListId);},
        create() {
            if (this.menuVal === 4) {
                if (!this.partyId) {
                    return;
                }
                sendPartyChat(this.partyId, this.createInput, (success) => {
                    if (success) {
                        this.createInput = '';
                        this.openPartyPage();
                    } else {
                        this.showErrMsg();
                    }
                });
            } else {
                let type = this.menuVal === 1 ? "habit" : this.menuVal === 2 ? "daily" : this.menuVal === 3 ? "todo" : "";
                createTask(this.createInput, type, (success) => {
                    if (success) {
                        this.createInput = '';
                    } else {
                        this.showErrMsg();
                    }
                    this.onSynchronousData();
                });
            }
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
                bulkUpScore(doneList, (success, data) => {
                    if (success) {
                        this.undoneList = [];
                        cronTask((cronSuccess) => {
                            cronSuccess ? this.onSynchronousData() : this.openHabitica();
                        });
                    } else {
                        this.showErrMsg(data);
                    }
                });
            } else {
                cronTask((success) => {
                    success ? this.onSynchronousData() : this.openHabitica();
                });
            }
        },
        setDefaultTag(reset) {
            if (this.conservedTag[0] === 0) {
                let tags = getFromDB(DB_KEY_TAG_SETTING);
                if (!tags) {
                    this.selectTag = 1;
                    this.conservedTag[0] = 1;
                    return;
                }
                let stringArr = tags.split(DB_KEY_SPLIT);
                for (let i = 0; i < stringArr.length; ++i) {
                    this.conservedTag[i] = parseInt(stringArr[i]);
                }
            }else if (reset === 0) {
                this.selectTag = 0;
                return;
            }
            this.selectTag = this.conservedTag[this.menuVal - 1];
        },
        handleOpenDetails(task){
            let list = task.checklist ? JSON.parse(JSON.stringify(task.checklist)) : [];
            this.taskDetails = {
                id: task.id,
                text: task.text,
                notes: task.notes,
                up: task.up,
                down: task.down,
                priority: task.priority,
                frequency: task.frequency,
                counterUp: task.counterUp,
                counterDown: task.counterDown,
                checklist: list,
                newInputCheckList: "",
                startDate: task.startDate,
                everyX: task.everyX,
                repeat: task.repeat,
                streak: task.streak,
                date: task.date
            };
            this.taskDetailDialog = true;
        },
        handleTaskDetailClose() {
            this.taskDetailDialog = false;
            this.taskDetails = {};
        },
        createSubTask() {
            let input = this.taskDetails.newInputCheckList;
            if (input == null || input.trim().length <= 0) {
                return;
            }
            let uuidUrl = URL.createObjectURL(new Blob()).toString();
            let uuid = uuidUrl.substr(uuidUrl.lastIndexOf("/") + 1);
            this.taskDetails.checklist.push({
                "completed": false,
                "text": input,
                "id": uuid
            });
            this.taskDetails.newInputCheckList = "";
        },
        deleteSubTask(id) {
            for (let i = 0; i < this.taskDetails.checklist.length; ++i) {
                if (this.taskDetails.checklist[i].id === id) {
                    this.taskDetails.checklist.splice(i, 1);
                }
            }
        },
        deleteIfNull(item) {
            if (!item ||!item.text || item.text.length <= 0) {
                this.deleteSubTask(item.id);
            }
        },
        onUpdateTask() {
            updateHBTask(this.taskDetails.id, this.taskDetails, (success, data) => {
                if (success) {
                    this.onSynchronousData();
                    this.taskDetailDialog = false;
                    this.taskDetails = {};
                } else {
                    this.showErrMsg(data);
                }
            });
        },
        onDeleteTask(id) {
            this.$confirm('确定删除？', '提示', {
                confirmButtonText: '很确定',
                cancelButtonText: '手抖了',
                type: 'warning'
            }).then(() => {
                deleteHBTask(this.taskDetails.id, (success, data) => {
                    if (success) {
                        this.onSynchronousData();
                        this.taskDetailDialog = false;
                        this.taskDetails = {};
                    } else {
                        this.showErrMsg(data);
                    }
                });
            });
        },
        openPartyPage() {
            this.showTaskList = [];
            if (!this.partyId) {
                this.menuVal = 4;
                return;
            }
            if (this.requestLock) {
                return;
            }
            this.requestLock = true;
            getHBPartyInfo(this.partyId,(success, data) => {
                if (success) {
                    let userId = headers["x-api-user"];
                    location.href = "#party_list";
                    let questKey = data.quest.key;
                    let joinCount = 0;
                    let isAccept = false;
                    if (questKey) {
                        questKey = findQuestNameByKey(questKey);
                        let members = data.quest.members;
                        for (let member in members) {
                            if (members[member]) {
                                joinCount++;
                                if (member === userId) {
                                    isAccept = true
                                }
                            }
                        }
                    }
                    let progress = data.quest.progress;
                    let haveHp = !!progress.hp;
                    let schedule = "";
                    if (haveHp) {
                        schedule = progress.hp.toFixed(2);
                    } else {
                        for(let key in progress.collect) {
                            let name = findCollectNameByKey(key);
                            schedule += name + ": " + progress.collect[key] + ", ";
                        }
                        schedule = schedule.substr(0, schedule.length - 2);
                    }
                    this.partyQuest = {
                        active: data.quest.active,
                        joinMembers: joinCount,
                        key: questKey,
                        isAccept: isAccept,
                        haveHP: haveHp,
                        schedule: schedule
                    };
                    this.partyMembers = data.memberCount;
                    this.partyChat = [];
                    let leader = data.leader.id;
                    for (let i = 0; i < data.chat.length; ++i) {
                        let chat = data.chat[i];
                        let user = chat.user;
                        let text = chat.text;
                        if (!user) {
                            text = text.replaceAll('`', '');
                            user = "系统";
                        }
                        let match = text.match(/\[(.*?)\]\((.*?)\)/);
                        while (match) {
                            text = text.replaceAll(match[0], match[1]);
                            match = text.match(/\[(.*?)\]\((.*?)\)/);
                        }
                        this.partyChat.push({
                            id: chat._id,
                            text: text,
                            user: user,
                            timestamp: new Date(chat.timestamp).toLocaleString('zh', {hour12: false}),
                            canDel: userId === chat.uuid || userId === leader
                        });
                    }
                    this.$message({message: '同步完成', center: true, type: 'success', duration: 1000, offset: 70});
                } else {
                    this.showErrMsg(data);
                }
                this.menuVal = 4;
                this.setDefaultTag(0);
                this.requestLock = false;
            });
        },
        joinInQuest() {
            if (!this.partyId) {
                openBrowser("https://habitica.com/party");
                return;
            }
            responsePartyQuest(this.partyId, "accept", (success, data) => {
                if (success) {
                    this.partyQuest.isAccept = true;
                    this.partyQuest.joinMembers++;
                    if (this.partyQuest.joinMembers === this.partyMembers) {
                        this.partyQuest.active = true;
                    }
                } else {
                    this.showErrMsg(data === 401 ? "退出后不能再加入了" : data);
                }
            });
        },
        quitOutQuest() {
            this.$confirm('退出副本？退出后将不能再次加入', '提示', {
                confirmButtonText: '很确定',
                cancelButtonText: '手抖了',
                type: 'warning'
            }).then(() => {
                responsePartyQuest(this.partyId,"leave", (success, data) => {
                    if (success) {
                        this.partyQuest.isAccept = false;
                        this.partyQuest.joinMembers--;
                    } else {
                        this.showErrMsg(data === 401 ? "副本发起者不能离开副本" : data);
                    }
                })
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
    },
    watch: {
        menuVal: function (newVal, oldVal) {
            if (newVal === 1) {
                this.dynamicTags = [{index: 1, name: "全 部"}, {index: 2, name: "偶 尔"}, {index: 3, name: "经 常"}];
            }else if (newVal === 2) {
                this.dynamicTags = [{index: 4, name: "全 部"}, {index: 5, name: "待 办"}, {index: 6, name: "已 办"}];
            }else if (newVal === 3) {
                this.dynamicTags = [{index: 7, name: "进 行"}, {index: 8, name: "限 时"}, {index: 9, name: "已 办"}];
            }else if (newVal === 4) {
                this.dynamicTags = [{index: 10, name: "全 部"}, {index: 11, name: "成 员"}, {index: 12, name: "系 统"}];
            }
            this.setDefaultTag();
        },
        selectTag: function (newVal, oldVal) {
            if (newVal === 0) {
                this.selectTag = this.conservedTag[this.menuVal - 1];
                return;
            }
            this.showTaskList = [];
            let oldArr = this.conservedTag.join(DB_KEY_SPLIT);
            if (newVal === 1) {
                this.showTaskList = this.habitList;
                this.conservedTag[0] = newVal;
            } else if (newVal === 2 || newVal === 3) {
                for (let i = 0; i < this.habitList.length; ++i) {
                    if ((newVal === 2 && this.habitList[i].value < 1) || (newVal === 3 && this.habitList[i].value >= 1)) {
                        this.showTaskList.push(this.habitList[i]);
                    }
                }
                this.conservedTag[0] = newVal;
            } else if (newVal === 4) {
                this.showTaskList = this.dailyList;
                this.conservedTag[1] = newVal;
            } else if (newVal === 5 || newVal === 6) {
                for (let i = 0; i < this.dailyList.length; ++i) {
                    let isUndo = this.dailyList[i].completed || !this.dailyList[i].isDue;
                    if ((newVal === 5 && !isUndo) || (newVal === 6 && isUndo)) {
                        this.showTaskList.push(this.dailyList[i]);
                    }
                }
                this.conservedTag[1] = newVal;
            } else if (newVal === 7 || newVal === 8) {
                for (let i = 0; i < this.todoList.length; ++i) {
                    if ((newVal === 7 && !this.todoList[i].completed) || (newVal === 8 && this.todoList[i].date && !this.todoList[i].completed)) {
                        this.showTaskList.push(this.todoList[i]);
                    }
                }
                this.conservedTag[2] = newVal;
            } else if (newVal === 9) {
                getHBCompletedTask((tasks) => {
                    if (tasks == null) {
                        this.showErrMsg();
                        return;
                    }
                    let now = new Date();
                    for (let i = 0; i < tasks.length; ++i) {
                        let task = tasks[i];
                        this.showTaskList.push({
                            id: task.id,
                            text: task.text,
                            notes: task.notes,
                            color: getColorByValue(task.value),
                            completed: task.completed,
                            collapseChecklist: task.collapseChecklist,
                            checklist: task.checklist,
                            date: task.date,
                            dateMsg: getDateReminder(now, task.date)
                        });
                    }
                    this.conservedTag[2] = newVal;
                });
            } else if (newVal === 10) {
                this.showTaskList = this.partyChat;
                this.conservedTag[3] = newVal;
            } else if (newVal === 11 || newVal === 12) {
                for (let i = 0; i < this.partyChat.length; ++i) {
                    if (newVal === 12 && this.partyChat[i].user === '系统' || newVal === 11 && this.partyChat[i].user !== '系统') {
                        this.showTaskList.push(this.partyChat[i]);
                    }
                }
                this.conservedTag[3] = newVal;
            }
            setTimeout(() => {
                let saveArr = this.conservedTag.join(DB_KEY_SPLIT);
                if (saveArr !== oldArr) {
                    let rev = getRevFromDB(DB_KEY_TAG_SETTING);
                    saveToDB(DB_KEY_TAG_SETTING, saveArr, rev);
                }
            }, 1);
        }
    }
});