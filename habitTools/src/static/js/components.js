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
        userClass: '',
        userAvatarImg: "",
        name: "",
        username: "",
        level: 0,
        sleep: false,
        HP: 0,
        EXP: 0,
        maxEXP: 0,
        MP: 0,
        maxMP: 0,
        GP: 0,
        menuVal: 1,
        selectTag: 0,
        conservedTag: [0,4,7,10,13],
        dynamicTags: [{index: 1, name: "全 部"}, {index: 2, name: "偶 尔"}, {index: 3, name: "经 常"}],
        habitList: [],
        dailyList: [],
        todoList: [],
        rewardList: [],
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
            date: "",
            cost: 0
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
        partyChat: [],
        clickSkillKey: null,
        clickSkillName: null,
        isShowSkillTasks: false,
        undoDailyNum: 0,
        undoTodoNum: 0
    },
    methods: {
        onRegistered() {openBrowser(API_ROOT + "/static/home");},
        doNone() {return false;},
        showErrMsg(msg) {
            let that = this;
            setTimeout(function () {that.$message.error(msg);}, 200);
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
                    this.refreshData(data, null);
                    saveToDB(DB_KEY_USER_INFO, window.btoa(this.userForm.key + DB_KEY_SPLIT + this.userForm.user));
                    this.userForm.key = '';
                    this.userForm.user = '';
                    this.isLoading = false;
                } else {
                    this.loginDialog = true;
                    this.showErrMsg(data);
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
            if (this.requestLock) {
                return;
            }
            this.requestLock = true;
            let load = this.$message({message: '同步中...', center: true, duration: 0});
            getHBUserInfo((success, data) => {
                this.requestLock = false;
                if (success) {
                    this.refreshData(data, load);
                } else {
                    load.close();
                    this.showErrMsg(data);
                }
            });
        },
        refreshData(userInfo, load) {
            this.name = userInfo.profile.name;
            this.username = userInfo.auth.local.username;
            this.level = userInfo.stats.lvl;
            this.sleep = userInfo.preferences.sleep;
            let hp = userInfo.stats.hp;
            if (hp <= 0) {
                this.openHabitica();
            }
            this.HP = hp;
            this.EXP = userInfo.stats.exp;
            this.maxEXP = userInfo.stats.toNextLevel;
            this.MP = userInfo.stats.mp;
            this.maxMP = userInfo.stats.maxMP;
            this.GP = userInfo.stats.gp;
            this.userClass = userInfo.stats.class;
            this.userAvatarImg = "./src/static/svg/" + userInfo.stats.class + ".svg";
            this.partyId = userInfo.party._id;
            this.isLoading = false;
            getHBHabit((success, data) => {
                if (!success) {
                    if (load) {
                        load.close();
                    }
                    this.showErrMsg(data);
                    return;
                }
                this.habitList = [];
                this.dailyList = [];
                this.todoList = [];
                this.rewardList = [];
                this.undoneList = [];
                this.undoDailyNum = 0;
                this.undoTodoNum = 0;
                let now = new Date();
                for (let i = 0; i < data.length; ++i) {
                    let task = data[i];
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
                    } else if (task.type === "daily") {
                        let due = task.isDue;
                        this.dailyList.push({
                            id: task.id,
                            text: task.text,
                            notes: task.notes,
                            color: getColorByValue(task.value),
                            completed: task.completed,
                            isDue: due,
                            repeat: task.repeat,
                            everyX: task.everyX,
                            collapseChecklist: task.collapseChecklist,
                            checklist: task.checklist,
                            priority: String(task.priority),
                            frequency: task.frequency,
                            startDate: task.startDate,
                            streak: task.streak,
                            nextDue: task.nextDue,
                            daysOfMonth: task.daysOfMonth,
                            weeksOfMonth: task.weeksOfMonth
                        });
                        if (due) {
                            this.undoDailyNum++;
                        }
                    } else if (task.type === "todo") {
                        this.todoList.push({
                            id: task.id,
                            text: task.text,
                            notes: task.notes,
                            color: getColorByValue(task.value),
                            completed: task.completed,
                            collapseChecklist: task.collapseChecklist,
                            checklist: task.checklist,
                            date: task.date,
                            dateMsg: getDateReminder(now, task.date),
                            priority: String(task.priority),
                        });
                        this.undoTodoNum++;
                    } else if (task.type === "reward") {
                        this.rewardList.push({
                            id: task.id,
                            text: task.text,
                            notes: task.notes,
                            color: getColorByValue(0),
                            cost: task.value
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
                                                if (calcDate > dateCron) break;
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
                                                if (calcDate > dateCron) break;
                                                calcDate.setDate(calcDate.getDate() + (daily.everyX * 7));
                                            }
                                        }
                                    } else if (daily.frequency === "monthly") {
                                        if (daily.daysOfMonth.length + daily.weeksOfMonth.length <= 0) {
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
                        cronTask((cronSuccess) => {
                            cronSuccess ? this.onSynchronousData() : this.openHabitica();
                        });
                    }
                }
                if (load) {
                    load.close();
                }
                this.$message({message: '同步完成', center: true, type: 'success', duration: 1000});
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
        openHabitica() {openBrowser(API_ROOT);},
        formatHP(percentage) {return ~~this.HP;},
        formatEXP(percentage) {return ~~this.EXP;},
        formatMP(percentage) {return ~~this.MP;},
        changeCollapseIcon(id, collapseChecklist) {updateHBTask(id, {"collapseChecklist": collapseChecklist},()=>{});},
        notifyMsg(msg, type) {
            this.$notify({message: msg, position: 'bottom-left', type: type, duration: 2000, offset:70});
        },
        async modifyStatus(hp, lvl, exp, mp, gp) {
            if (hp < this.HP) {
                await this.notifyMsg('生命 -' + (this.HP - hp).toFixed(2), 'warning');
            }
            if (hp <= 0) {
                this.openHabitica();
            }
            this.HP = hp;
            if (lvl > this.level) {
                await this.notifyMsg('经验 +' + (this.maxEXP - this.EXP + exp).toFixed(2), 'success');
                await this.notifyMsg('恭喜升级了！', 'success');
            } else if (exp < this.EXP) {
                await this.notifyMsg('经验 -' + (this.EXP - exp).toFixed(2), 'warning');
            } else if (exp > this.EXP){
                await this.notifyMsg('经验 +' + (exp - this.EXP).toFixed(2), 'success');
            }
            this.level = lvl;
            this.EXP = exp;
            if (mp < this.MP) {
                await this.notifyMsg('魔法 -' + (this.MP - mp).toFixed(2), 'warning');
            } else if (mp > this.MP){
                await this.notifyMsg('魔法 +' + (mp - this.MP).toFixed(2), 'success');
            }
            this.MP = mp;
            if (gp < this.GP) {
                await this.notifyMsg('金币 -' + (this.GP - gp).toFixed(2), 'warning');
            } else if (gp > this.GP){
                await this.notifyMsg('金币 +' + (gp - this.GP).toFixed(2), 'success');
            }
            this.GP = gp;
        },
        scoreTask(task, direction) {
            if (this.requestLock) {
                return;
            }
            this.requestLock = true;
            let menuVal = this.menuVal;
            if (menuVal === 1 && ((direction === 'up' && !task.up) || (direction === 'down' && !task.down))) {
                return;
            }
            scoreHBTask(task.id, direction, (success, data) => {
                if (success) {
                    let selectTag = this.selectTag;
                    if (menuVal === 1) {
                        direction === 'up' ? task.counterUp++ : task.counterDown++;
                        task.value += data.delta;
                        task.color = getColorByValue(task.value);
                        if ((selectTag === 2 && task.value >= 1) || (selectTag === 3 && task.value < 1)) {
                            this.selectTag = 0;
                        }
                    } else if (menuVal !== 4) {
                        if (selectTag === 9) {
                            let now = new Date();
                            task.dateMsg = getDateReminder(now, task.date);
                            this.todoList.push(task);
                            this.undoTodoNum++;
                        }
                        let after = !task.completed;
                        if (menuVal === 2) {
                            if (after) {
                                this.undoDailyNum--;
                            } else {
                                this.undoDailyNum++;
                            }
                        }
                        task.completed = after;
                        task.color = getColorByValue(task.value);
                        this.selectTag = 0;
                    }
                    this.modifyStatus(data.hp, data.lvl, data.exp, data.mp, data.gp);
                } else {
                    this.showErrMsg(data);
                }
                this.requestLock = false;
            });
        },
        scoreCheckList(taskId, checkListId) {scoreHBCheckList(taskId, checkListId);},
        create() {
            if (this.menuVal === 5) {
                if (!this.partyId) {
                    return;
                }
                sendPartyChat(this.partyId, this.createInput, (success, data) => {
                    if (success) {
                        this.createInput = '';
                        this.openPartyPage();
                    } else {
                        this.showErrMsg(data);
                    }
                });
            } else {
                let type = this.menuVal === 1 ? "habit" : this.menuVal === 2 ? "daily" : this.menuVal === 3 ? "todo" : this.menuVal === 4 ? "reward" : "";
                createTask(this.createInput, type, (success, data) => {
                    if (success) {
                        this.createInput = '';
                        this.onSynchronousData();
                    } else {
                        this.showErrMsg(data);
                    }
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
                date: task.date,
                value: task.cost
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
            this.createSubTask();
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
                this.menuVal = 5;
                return;
            }
            if (this.requestLock) {
                return;
            }
            this.requestLock = true;
            getHBPartyInfo(this.partyId,(success, data) => {
                this.requestLock = false;
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
                    for (let i = 0; i < data.chat.length; ++i) {
                        let chat = data.chat[i];
                        let user = chat.user;
                        this.partyChat.push({
                            id: chat._id,
                            text: chat.text,
                            user: user ? user : '系统',
                            timestamp: new Date(chat.timestamp).toLocaleString('zh', {hour12: false}),
                        });
                    }
                    this.$message({message: '同步完成', center: true, type: 'success', duration: 1000});
                } else {
                    this.showErrMsg(data);
                }
                this.menuVal = 5;
                this.setDefaultTag(0);
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
                    this.showErrMsg(data);
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
                        this.showErrMsg(data);
                    }
                })
            });
        },
        dragTaskEnd(evt) {
            this.drag = false;
            let oldIndex = evt.oldIndex;
            let newIndex = evt.newIndex;
            if (oldIndex === newIndex) {
                return;
            }
            let target = 0;
            let arr = this.menuVal === 1 ? this.habitList : this.menuVal === 2 ? this.dailyList : this.menuVal === 3 ? this.todoList : this.menuVal === 4 ? this.rewardList : [];

            let relative = oldIndex < newIndex ? newIndex - 1 : newIndex + 1;
            for (let i = 0; i < arr.length; i++) {
                if (this.showTaskList[relative].id === arr[i].id) {
                    target = i;
                    break;
                }
            }
            dragHabiticaTask(this.showTaskList[newIndex].id, target, (success, data) => {
                if (success) {
                    arr.sort((a, b) => {
                        return data.indexOf(a.id) - data.indexOf(b.id);
                    });
                } else {
                    this.showErrMsg(data);
                }
            });
        },
        castSkill(key, name, target) {
            castHabiticaSkill(key, target, async (success, data) => {
                if (success) {
                    await this.notifyMsg('使出了' + name, 'success');
                    this.modifyStatus(data.hp, data.lvl, data.exp, data.mp, data.gp);
                } else {
                    this.showErrMsg(data);
                }
            });
            this.closeSkillTask();
        },
        showSkillTask(key, name) {
            this.isShowSkillTasks = true;
            this.clickSkillKey = key;
            this.clickSkillName = name;
        },
        closeSkillTask() {
            this.isShowSkillTasks = false;
            this.clickSkillKey = null;
            this.clickSkillName = null;
        },
        buyHealth() {
            buyHealthPotion(async (success, data) => {
                if (success) {
                    await this.notifyMsg('购买了治疗药水', 'success');
                    this.modifyStatus(data.hp, data.lvl, data.exp, data.mp, data.gp);
                } else {
                    this.showErrMsg(data);
                }
            });
        },
        userSleep() {
            let target = !this.sleep;
            sleep(target,async (success, data) => {
                if (success) {
                    await this.notifyMsg(target ? "已暂停任务伤害" : "已开启任务伤害", 'success');
                    this.sleep = target;
                } else {
                    this.showErrMsg(data);
                }
            });
        },
        markedText(text) {
            if (typeof text == 'undefined' || text == null) return '';
            return marked(text, {sanitize: true, smartLists: true});
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
            } else if (newVal === 2) {
                this.dynamicTags = [{index: 4, name: "全 部"}, {index: 5, name: "待 办"}, {index: 6, name: "已 办"}];
            } else if (newVal === 3) {
                this.dynamicTags = [{index: 7, name: "进 行"}, {index: 8, name: "限 时"}, {index: 9, name: "已 办"}];
            } else if (newVal === 4) {
                this.dynamicTags = [{index: 10, name: "全 部"}, {index: 11, name: "定 制"}, {index: 12, name: "其 他"}];
            } else if (newVal === 5) {
                this.dynamicTags = [{index: 13, name: "全 部"}, {index: 14, name: "成 员"}, {index: 15, name: "系 统"}];
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
                for (let i = 0; i < this.habitList.length; ++i) {
                    this.showTaskList.push(this.habitList[i]);
                }
                this.conservedTag[0] = newVal;
            } else if (newVal === 2 || newVal === 3) {
                for (let i = 0; i < this.habitList.length; ++i) {
                    if ((newVal === 2 && this.habitList[i].value < 1) || (newVal === 3 && this.habitList[i].value >= 1)) {
                        this.showTaskList.push(this.habitList[i]);
                    }
                }
                this.conservedTag[0] = newVal;
            } else if (newVal === 4) {
                for (let i = 0; i < this.dailyList.length; ++i) {
                    this.showTaskList.push(this.dailyList[i]);
                }
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
                getHBCompletedTask((success, data) => {
                    if (!success) {
                        this.showErrMsg(data);
                        return;
                    }
                    for (let i = 0; i < data.length; ++i) {
                        let task = data[i];
                        let cDate = new Date(task.dateCompleted).toLocaleString('zh', {hour12: false});
                        this.showTaskList.push({
                            id: task.id,
                            text: task.text,
                            notes: task.notes,
                            color: getColorByValue(task.value),
                            completed: task.completed,
                            collapseChecklist: task.collapseChecklist,
                            checklist: task.checklist,
                            date: task.date,
                            dateMsg: "完成时间：" + cDate
                        });
                    }
                    this.conservedTag[2] = newVal;
                });
            } else if (newVal === 10 || newVal === 11) {
                for (let i = 0; i < this.rewardList.length; ++i) {
                    this.showTaskList.push(this.rewardList[i]);
                }
                this.conservedTag[3] = newVal;
            } else if (newVal === 12) {
                this.conservedTag[3] = newVal;
            } else if (newVal === 13) {
                this.showTaskList = this.partyChat;
                this.conservedTag[4] = newVal;
            } else if (newVal === 14 || newVal === 15) {
                for (let i = 0; i < this.partyChat.length; ++i) {
                    if (newVal === 15 && this.partyChat[i].user === '系统' || newVal === 14 && this.partyChat[i].user !== '系统') {
                        this.showTaskList.push(this.partyChat[i]);
                    }
                }
                this.conservedTag[4] = newVal;
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