const ahk = require('node-to-ahk')

module.exports = function NoDirectionalSkills(dispatch) {
    const skills = require('./config.js')
    
    let job = -1,
        keys = {}

    // get WASD status
    for (let hotkey of ['w', 'a', 's', 'd']) {
        keys[hotkey] = false
        ahk.hook(`~$*${hotkey}`, keyHandler, 'ahk_exe TERA.exe')
        ahk.hook(`~$*${hotkey} UP`, keyHandler, 'ahk_exe TERA.exe')
    }

    // get WASD status
    function keyHandler(key) {
        for (let hotkey of ['w', 'a', 's', 'd']) {
            if (key.includes(hotkey)) {
                if (key.includes('UP')) {
                    keys[hotkey] = false
                }
                else {
                    keys[hotkey] = true
                }
            }
        }
    }

    // get skill base
	function skillbase(skill) {
		return Math.floor((skill - 0x4000000) / 10000)
	}

    // get class
	dispatch.hook('S_LOGIN', 10, (event) => {
		job = (event.templateId - 10101) % 100
    })

    // change direction to camera
	dispatch.hook('C_START_SKILL', 5, {order: -9999}, (event) => {
        let skill = skillbase(event.skill)
        if(skills && skills[job] && skills[job][skill] && event.moving) {
            if (keys.a && !keys.d && keys.w == keys.s) event.w += Math.PI / 2 // A
            if (!keys.a && keys.d && keys.w == keys.s) event.w -= Math.PI / 2 // D
            if (!keys.w && keys.s && keys.a == keys.d) event.w += Math.PI // S
            if (keys.w && keys.a && !keys.s && !keys.d) event.w += Math.PI / 4 // W+A
            if (keys.w && !keys.a && !keys.s && keys.d) event.w -= Math.PI / 4 // W+D
            if (!keys.w && !keys.a && keys.s && keys.d) event.w -= Math.PI * 3 / 4 // S+D
            if (!keys.w && keys.a && keys.s && !keys.d) event.w += Math.PI * 3 / 4 // S+A
            if (event.w > Math.PI) event.w -= Math.PI * 2
            if (event.w < -Math.PI) event.w += Math.PI * 2
            return true
        }
	})
}
