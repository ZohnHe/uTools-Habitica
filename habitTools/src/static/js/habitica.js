const API_ROOT = "https://habitica.com";
const USER_INFO_URL = API_ROOT + "/api/v4/user";
const TASKS_UPDATE_URL = API_ROOT + "/api/v4/tasks/";
const TASKS_URL = TASKS_UPDATE_URL + "user";
const CRON_URL = API_ROOT + "/api/v4/cron";
const BULK_SCORE_URL = API_ROOT + "/api/v4/tasks/bulk-score";
const COMPLETED_TASK_URL = API_ROOT + "/api/v4/tasks/user?type=completedTodos";
const PARTY_URL = API_ROOT + "/api/v4/groups/";
const CAST_URL = USER_INFO_URL + "/class/cast/";
const BUY_HEALTH_URL = USER_INFO_URL + "/buy-health-potion";
const SLEEP_URL = USER_INFO_URL + "/sleep";

const headers = {'x-client': "ab029ac0-b53c-451b-829b-1138d283a40c-habitTools", 'x-api-user': '', 'x-api-key': ''};
const QUEST_MAP = {"evilsanta":"圣诞偷猎者","evilsanta2":"找熊崽","gryphon":"火红的狮鹫","hedgehog":"巨型刺猬","ghost_stag":"春之幽灵","rat":"鼠王","octopus":"章鱼克苏鲁的呼唤","harpy":"救命！哈耳庇厄！","rooster":"狂暴公鸡","spider":"寒霜蜘蛛","vice1":"恶习之龙，第1部：逃出恶习之龙的控制","vice2":"恶习之龙，第2部：寻找巨龙的巢穴","vice3":"恶习之龙，第3部：恶习缓醒","moonstone1":"故态复萌，第1部：月长石链","moonstone2":"故态复萌，第2部：亡灵法师Recidivate","moonstone3":"故态复萌，第3部：Recidivate变形","goldenknight1":"黄金骑士，第1部：一场严肃的谈话","goldenknight2":"黄金骑士，第2部：黄金骑士","goldenknight3":"黄金骑士，第3部：钢铁骑士","basilist":"普通的清单魔蛇","egg":"找彩蛋","dilatory":"恐怖的拖延巨龙","dilatory_derby":"拖拉比赛","atom1":"平凡世界的攻势，第1部：碗碟的灾难！","atom2":"平凡世界的攻势，第2部：好吃懒做怪","atom3":"平凡世界的攻势，第3部：洗衣终结者","owl":"暗夜猫头鹰","penguin":"冰霜禽类","stressbeast":"Stoïkalm草原的可恶压力兽","trex":"恐龙王","trex_undead":"出土恐龙化石","rock":"逃离山洞生物","bunny":"杀人兔","slime":"果冻摄政王","sheep":"雷霆公羊","kraken":"未完成海妖","whale":"鲸之哀嚎","dilatoryDistress1":"拖拉灾难，第1部：漂流瓶中的信","dilatoryDistress2":"拖拉灾难，第2部：裂缝中的生物","dilatoryDistress3":"拖拉灾难，第3部：不只是人鱼姑娘","cheetah":"真是一个猎豹","horse":"驾驭噩梦","burnout":"湮灭怪和被耗尽的灵魂","frog":"蛙泽","snake":"分心蛇","unicorn":"说服独角兽女王","sabretooth":"剑齿猫","monkey":"巨大的山魈和淘气的猴子","snail":"苦差事淤泥蜗牛","bewilder":"迷失怪","falcon":"掠食明天之鸟","treeling":"纠结树","axolotl":"魔法蝾螈","turtle":"引导海龟","armadillo":"放纵的犰狳","cow":"变异奶牛","beetle":"严重的BUG","taskwoodsTerror1":"恐怖的任务森林，第1部：任务树林中的大火","taskwoodsTerror2":"恐怖的任务森林，第2部：找到丰收精灵","taskwoodsTerror3":"恐怖的任务森林，第3部：杰克南瓜灯","ferret":"恶毒的雪貂","dustbunnies":"野生的灰尘兔子","moon1":"月亮战争，第1部：寻找神秘碎片","moon2":"月亮战争，第2部：驱逐遮天蔽日的压力","moon3":"月亮战争，第3部：巨大的月亮","sloth":"昏昏欲睡的树懒","triceratops":"跺脚的三角龙","stoikalmCalamity1":"Stoïkalm灾难，第1部：地上的敌人","stoikalmCalamity2":"Stoïkalm灾难，第2部：寻找冰柱洞穴","stoikalmCalamity3":"Stoïkalm灾难，第3部：冰柱德雷克地震","guineapig":"豚鼠团伙","peacock":"拖拉孔雀","butterfly":"再见啦，蝴蝶","mayhemMistiflying1":"Misti飞城的混乱，第1部：Misti飞城遇到可怕的麻烦","mayhemMistiflying2":"Misti飞城的混乱，第2部：疾风更盛","mayhemMistiflying3":"Misti飞城的混乱，第3部：粗鲁的邮递员","nudibranch":"NowDo海兔的侵袭","hippo":"好一个伪君子","lostMasterclasser1":"大师鉴别者的秘密，第1部：字里行间","lostMasterclasser2":"大师鉴别者的秘密，第2部：召唤逃避者","lostMasterclasser3":"大师鉴别者的秘密，第3部：黄沙掩埋的城市","lostMasterclasser4":"大师鉴别者的秘密，第4部：迷失的大师鉴别者","yarn":"一条缠绕的毛线","pterodactyl":"翼龙","badger":"快别缠着我了！","dysheartener":"失恋怪","squirrel":"狡猾的松鼠","seaserpent":"深度危险：海蛇冲撞！","kangaroo":"袋鼠大灾变","alligator":"鳄鱼的煽动：此刻更要紧的事","velociraptor":"光速rap迅猛龙","robot":"神奇的机械奇迹！","amber":"琥珀联盟","dolphin":"怀疑海豚","silver":"银溶液","bronze":"大战青铜甲虫","ruby":"红宝石的关系","waffle":"跟愚者胡扯：灾难早餐！","fluorite":"吓人的发光萤石","windup":"失控的发条战士","turquoise":"探寻绿松石宝藏","blackPearl":"星星的奇思妙想","stone":"布满青苔的迷宫","solarSystem":"宇宙集中之旅"};
const COLLECT_MAP = {"tracks":"爪印","branches":"踩断的树枝","lightCrystal":"神光水晶","moonstone":"月长石","testimony":"证据","plainEgg":"普通的蛋","soapBars":"肥皂","fireCoral":"烈焰珊瑚","blueFins":"湛蓝之鳍","pixie":"小精灵","brownie":"淘气鬼","dryad":"树妖","shard":"月之碎片","icicleCoin":"被冰冻的硬币","mistifly1":"红色Misti蝴蝶","mistifly2":"蓝色Misti蝴蝶","mistifly3":"绿色Misti蝴蝶","ancientTome":"古籍","forbiddenTome":"禁书","hiddenTome":"藏书","spring":"弹簧","bolt":"螺栓","gear":"齿轮","silverIngot":"银锭","cancerRune":"巨蟹座符文","moonRune":"月亮符文","rubyGem":"红宝石","venusRune":"金星符文","aquariusRune":"水瓶座符文","turquoiseGem":"绿松石宝石","neptuneRune":"海王星符文","sagittariusRune":"射手座符文","mossyStone":"青苔石","capricornRune":"摩羯座符文","marsRune":"火星符文"};

function getErrResponseMsg(err) {
    let msg = null;
    if (err.response) {
        if (err.response.status === 429) {
            msg = "操作频繁，休息一会";
        } else if (err.response.data) {
            msg = err.response.data.message;
        } else {
            msg = err.response.status;
        }
    } else {
        msg = "与Habitica通信异常，需检查网络环境";
    }
    return msg;
}

function getHBUserInfo(doAfter) {
    axios.get(USER_INFO_URL, {headers: headers}).then(rsp => {
        rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error);
    }).catch(err => {
        console.error("getHBUserInfo error: ", err);
        doAfter(false, getErrResponseMsg(err));
    });
}

function getHBHabit(doAfter) {
    axios.get(TASKS_URL, {headers: headers}).then(rsp => {
        rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error);
    }).catch(err => {
        console.error("getHBHabit error: ", err);
        doAfter(false, getErrResponseMsg(err));
    });
}

function getColorByValue(value) {
    value = value ? Math.floor(value) : 0;
    if (value >= 10) {
        return "#438EB6";
    } else if (value >= 5) {
        return "#339DA8";
    } else if (value > 0) {
        return "#229F72";
    } else if (value === 0) {
        return "#DDA146";
    } else if (value > -10) {
        return "#DF7C39";
    } else {
        return "#C64F53";
    }
}

function updateHBTask(id, body, doAfter) {
    axios.put(TASKS_UPDATE_URL + id, body, {headers: headers}).then(rsp => {
        rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error);
    }).catch(err => {
        console.error("updateHBTask error: ", err);
        doAfter(false, getErrResponseMsg(err));
    });
}

function scoreHBTask(id, direction, doAfter) {
    axios.post(TASKS_UPDATE_URL + id + "/score/" + direction, {}, {headers: headers}).then(rsp => {
        rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error);
    }).catch(err => {
        console.error("scoreHBTask error: ", err);
        doAfter(false, getErrResponseMsg(err));
    });
}

function scoreHBCheckList(taskId, checkListId) {
    axios.post(TASKS_UPDATE_URL + taskId + "/checklist/" + checkListId + "/score", {}, {headers: headers});
}

function createTask(text, type, doAfter) {
    axios.post(TASKS_URL, {"text": text, "type": type}, {headers: headers}).then(rsp => {
        rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error);
    }).catch(err => {
        console.error("createTask error: ", err);
        doAfter(false, getErrResponseMsg(err));
    });
}
function bulkUpScore(body, doAfter) {
    axios.post(BULK_SCORE_URL, body, {headers: headers}).then(rsp => {
        rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error);
    }).catch(err => {
        console.error("bulkUpScore error: ", err);
        doAfter(false, getErrResponseMsg(err));
    });
}

function cronTask(doAfter) {
    axios.post(CRON_URL, null, {headers: headers}).then(rsp => {
        doAfter(rsp.data.success);
    }).catch(err => {
        console.error("cronTask error: ", err);
        doAfter(false);
    });
}

function getHBCompletedTask(doAfter) {
    axios.get(COMPLETED_TASK_URL, {headers: headers}).then(rsp => {
        rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error);
    }).catch(err => {
        console.error("getHBCompletedTask error: ", err);
        doAfter(false, getErrResponseMsg(err));
    });
}

function getDateReminder(now, date) {
    if (!date) {
        return null;
    }
    let diff = Math.floor((new Date(date).getTime() - now.getTime()) / 1000 / 60 / 60 / 24) + 1;
    if (diff > 0) {
        return "还剩 " + diff + " 天";
    } else if (diff < 0) {
        return "超时 " + Math.abs(diff) + " 天";
    } else {
        return "期限为今日";
    }
}

function deleteHBTask(id, doAfter) {
    axios.delete(TASKS_UPDATE_URL + id, {headers: headers}).then(rsp => {
        rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error);
    }).catch(err => {
        console.error("deleteHBTask error: ", err);
        doAfter(false, getErrResponseMsg(err));
    });
}

function getHBPartyInfo(partyId, doAfter) {
    axios.get(PARTY_URL + partyId, {headers: headers}).then(rsp => {
        rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error);
    }).catch(err => {
        console.error("getHBPartyInfo error: ", err);
        doAfter(false, getErrResponseMsg(err));
    });
}

function responsePartyQuest(id, direction, doAfter) {
    axios.post(PARTY_URL + id + "/quests/" + direction, {}, {headers: headers}).then(rsp => {
        rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error);
    }).catch(err => {
        console.error("responsePartyQuest error: ", err);
        doAfter(false, getErrResponseMsg(err));
    });
}

function sendPartyChat(id, msg, doAfter) {
    axios.post(PARTY_URL + id + "/chat", {message: msg}, {headers: headers}).then(rsp => {
        rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error);
    }).catch(err => {
        console.error("sendPartyChat error: ", err);
        doAfter(false, getErrResponseMsg(err));
    });
}

function dragHabiticaTask(taskId, index, doAfter) {
    axios.post(TASKS_UPDATE_URL + taskId + "/move/to/" + index, {}, {headers: headers}).then(rsp => {
        rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error);
    }).catch(err => {
        console.error("dragHabiticaTask error: ", err);
        doAfter(false, getErrResponseMsg(err));
    });
}

function castHabiticaSkill(spellId, targetId, doAfter) {
    let param = targetId ? '?targetId=' + targetId : '';
    axios.post(CAST_URL + spellId + param, {}, {headers: headers}).then(rsp => {
        rsp.data.success ? doAfter(true, rsp.data.data.user.stats) : doAfter(false, rsp.data.error);
    }).catch(err => {
        console.error("castHabiticaSkill error: ", err);
        doAfter(false, getErrResponseMsg(err));
    });
}

function buyHealthPotion(doAfter) {
    axios.post(BUY_HEALTH_URL, {}, {headers: headers}).then(rsp => {
        rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error);
    }).catch(err => {
        console.error("buyHealthPotion error: ", err);
        doAfter(false, getErrResponseMsg(err));
    });
}

function sleep(state, doAfter) {
    axios.post(SLEEP_URL, {data:state}, {headers: headers}).then(rsp => {
        rsp.data.success ? doAfter(true) : doAfter(false, "Habitica服务器异常");
    }).catch(err => {
        console.error("buyHealthPotion error: ", err);
        doAfter(false, getErrResponseMsg(err));
    });
}

function startPartyQuest(partyId, doAfter) {
    axios.post(PARTY_URL + partyId + "/quests/force-start", {}, {headers: headers}).then(rsp => {
        rsp.data.success ? doAfter(true, rsp.data.data) : doAfter(false, rsp.data.error);
    }).catch(err => {
        console.error("startPartyQuest error: ", err);
        doAfter(false, getErrResponseMsg(err));
    });
}

function findQuestNameByKey(key) {
    let name = QUEST_MAP[key];
    return name ? name : key;
}

function findCollectNameByKey(key) {
    let name = COLLECT_MAP[key];
    return name ? name : key;
}