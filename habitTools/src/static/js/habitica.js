const API_ROOT = "https://habitica.com";
const USER_INFO_URL = API_ROOT + "/api/v3/user";
const TASKS_UPDATE_URL = API_ROOT + "/api/v3/tasks/";
const TASKS_URL = TASKS_UPDATE_URL + "user";
const CRON_URL = API_ROOT + "/api/v3/cron";
const BULK_SCORE_URL = API_ROOT + "/api/v4/tasks/bulk-score";
const COMPLETED_TASK_URL = API_ROOT + "/api/v4/tasks/user?type=completedTodos";
const PARTY_URL = API_ROOT + "/api/v3/groups/";
const CAST_URL = USER_INFO_URL + "/class/cast/";
const BUY_HEALTH_URL = USER_INFO_URL + "/buy-health-potion";
const SLEEP_URL = USER_INFO_URL + "/sleep";

const headers = {'x-client': "ab029ac0-b53c-451b-829b-1138d283a40c-habitTools", 'x-api-user': '', 'x-api-key': ''};
const QUEST_MAP = {"evilsanta":"Trapper Santa","evilsanta2":"Find the Cub","gryphon":"The Fiery Gryphon","hedgehog":"The Hedgebeast","ghost_stag":"The Spirit of Spring","rat":"The Rat King","octopus":"The Call of Octothulu","harpy":"Help! Harpy!","rooster":"Rooster Rampage","spider":"The Icy Arachnid","vice1":"Vice, Part 1: Free Yourself of the Dragon's Influence","vice2":"Vice, Part 2: Find the Lair of the Wyrm","vice3":"Vice, Part 3: Vice Awakens","moonstone1":"Recidivate, Part 1: The Moonstone Chain","moonstone2":"Recidivate, Part 2: Recidivate the Necromancer","moonstone3":"Recidivate, Part 3: Recidivate Transformed","goldenknight1":"The Golden Knight, Part 1: A Stern Talking-To","goldenknight2":"The Golden Knight, Part 2: Gold Knight","goldenknight3":"The Golden Knight, Part 3: The Iron Knight","basilist":"The Basi-List","egg":"Egg Hunt","dilatory":"The Dread Drag'on of Dilatory","dilatory_derby":"The Dilatory Derby","atom1":"Attack of the Mundane, Part 1: Dish Disaster!","atom2":"Attack of the Mundane, Part 2: The SnackLess Monster","atom3":"Attack of the Mundane, Part 3: The Laundromancer","owl":"The Night-Owl","penguin":"The Fowl Frost","stressbeast":"The Abominable Stressbeast of the Stoïkalm Steppes","trex":"King of the Dinosaurs","trex_undead":"The Dinosaur Unearthed","rock":"Escape the Cave Creature","bunny":"The Killer Bunny","slime":"The Jelly Regent","sheep":"The Thunder Ram","kraken":"The Kraken of Inkomplete","whale":"Wail of the Whale","dilatoryDistress1":"Dilatory Distress, Part 1: Message in a Bottle","dilatoryDistress2":"Dilatory Distress, Part 2: Creatures of the Crevasse","dilatoryDistress3":"Dilatory Distress, Part 3: Not a Mere Maid","cheetah":"Such a Cheetah","horse":"Ride the Night-Mare","burnout":"Burnout and the Exhaust Spirits","frog":"Swamp of the Clutter Frog","snake":"The Serpent of Distraction","unicorn":"Convincing the Unicorn Queen","sabretooth":"The Sabre Cat","monkey":"Monstrous Mandrill and the Mischief Monkeys","snail":"The Snail of Drudgery Sludge","bewilder":"The Be-Wilder","falcon":"The Birds of Preycrastination","treeling":"The Tangle Tree","axolotl":"The Magical Axolotl","turtle":"Guide the Turtle","armadillo":"The Indulgent Armadillo","cow":"The Mootant Cow","beetle":"The CRITICAL BUG","taskwoodsTerror1":"Terror in the Taskwoods, Part 1: The Blaze in the Taskwoods","taskwoodsTerror2":"Terror in the Taskwoods, Part 2: Finding the Flourishing Fairies","taskwoodsTerror3":"Terror in the Taskwoods, Part 3: Jacko of the Lantern","ferret":"The Nefarious Ferret","dustbunnies":"The Feral Dust Bunnies","moon1":"Lunar Battle, Part 1: Find the Mysterious Shards","moon2":"Lunar Battle, Part 2: Stop the Overshadowing Stress","moon3":"Lunar Battle, Part 3: The Monstrous Moon","sloth":"The Somnolent Sloth","triceratops":"The Trampling Triceratops","stoikalmCalamity1":"Stoïkalm Calamity, Part 1: Earthen Enemies","stoikalmCalamity2":"Stoïkalm Calamity, Part 2: Seek the Icicle Caverns","stoikalmCalamity3":"Stoïkalm Calamity, Part 3: Icicle Drake Quake","guineapig":"The Guinea Pig Gang","peacock":"The Push-and-Pull Peacock","butterfly":"Bye, Bye, Butterfry","mayhemMistiflying1":"Mayhem in Mistiflying, Part 1: In Which Mistiflying Experiences a Dreadful Bother","mayhemMistiflying2":"Mayhem in Mistiflying, Part 2: In Which the Wind Worsens","mayhemMistiflying3":"Mayhem in Mistiflying, Part 3: In Which a Mailman is Extremely Rude","nudibranch":"Infestation of the NowDo Nudibranchs","hippo":"What a Hippo-Crite","lostMasterclasser1":"The Mystery of the Masterclassers, Part 1: Read Between the Lines","lostMasterclasser2":"The Mystery of the Masterclassers, Part 2: Assembling the a'Voidant","lostMasterclasser3":"The Mystery of the Masterclassers, Part 3: City in the Sands","lostMasterclasser4":"The Mystery of the Masterclassers, Part 4: The Lost Masterclasser","yarn":"A Tangled Yarn","pterodactyl":"The Pterror-dactyl","badger":"Stop Badgering Me!","dysheartener":"The Dysheartener","squirrel":"The Sneaky Squirrel","seaserpent":"Danger in the Depths: Sea Serpent Strike!","kangaroo":"Kangaroo Catastrophe","alligator":"The Insta-Gator","velociraptor":"The Veloci-Rapper","robot":"Brazen Beetle Battle","amber":"The Dolphin of Doubt","dolphin":"The Silver Solution","silver":"Mysterious Mechanical Marvels!","bronze":"The Amber Alliance","ruby":"Ruby Rapport","waffle":"Waffling with the Fool: Disaster Breakfast!","fluorite":"A Bright Fluorite Fright","windup":"A Whirl with a Wind-Up Warrior","turquoise":"Turquoise Treasure Toil","blackPearl":"A Startling Starry Idea","stone":"A Maze of Moss","solarSystem":"A Voyage of Cosmic Concentratio"};
const COLLECT_MAP = {"tracks":"Tracks","branches":"Broken Twigs","lightCrystal":"Light Crystals","moonstone":"Moonstones","testimony":"Testimonies","plainEgg":"Plain Eggs","soapBars":"Bars of Soap","fireCoral":"Fire Coral","blueFins":"Blue Fins","pixie":"Pixies","brownie":"Brownies","dryad":"Dryads","shard":"Lunar Shards","icicleCoin":"Icicle Coins","mistifly1":"Red Mistiflies","mistifly2":"Blue Mistiflies","mistifly3":"Green Mistiflies","ancientTome":"Ancient Tomes","forbiddenTome":"Forbidden Tomes","hiddenTome":"Hidden Tomes","spring":"Springs","bolt":"Bolts","gear":"Gears","silverIngot":"Silver Ingots","cancerRune":"Cancer Zodiac Runes","moonRune":"Moon Runes","rubyGem":"Ruby Gems","venusRune":"Venus Runes","aquariusRune":"Aquarius Zodiac Runes","turquoiseGem":"Turquoise Gems","neptuneRune":"Neptune Runes","sagittariusRune":"Sagittarius Runes","mossyStone":"Mossy Stones", "capricornRune": "Capricorn Runes","marsRune":"Mars Runes"};

function getErrResponseMsg(err) {
    let msg = null;
    if (err.response) {
        if (err.response.status === 429) {
            msg = "Frequent operation, take a break";
        } else if (err.response.data) {
            msg = err.response.data.message;
        } else {
            msg = err.response.status;
        }
    } else {
        msg = "The communication with Habitica is abnormal, you need to check the network environment";
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
        if (diff === 1) {
            return "Due in a day";
        }
        return "Due in " + diff + " days";
    } else if (diff < 0) {
        if (diff === -1) {
            return "Due a day ago";
        }
        return "Due " + Math.abs(diff) + " days ago";
    } else {
        return "Due Today";
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
        rsp.data.success ? doAfter(true) : doAfter(false, "Habitica server exception");
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