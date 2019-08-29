const disabledInputs = document.querySelectorAll('.inp-dsb');
const alarmInputs = document.querySelectorAll('.inp-crt');
const alarmBtn = document.querySelector('.btn-stl');
const alarmAudio = document.querySelector('audio');
const popupDiv = document.querySelector('.popup-div');
const errorBlock = document.querySelector('.error');
const btnClosePopup = document.querySelector('.btn-close');

const clock = {
	init: function(inputs, alarm, btn, aud, popup, errorEl, btnClose) {
		this.alarm = alarm;
		this.btn = btn;
		this.btnClose = btnClose;
		this.aud = aud;
		this.popup = popup;
		this.errorEl = errorEl;
		[this.hours, this.min, this.sec] = inputs;
		this.time = new Date();
		this.start(this);
		this.initAlarmEvent(this);
		this.closePopup(this);
		this.checkAlarmInput(this);
	},

	start: function (self, ssg) {
		this.hours.value = this.time.getHours();
		this.min.value = String(this.time.getMinutes()).padStart(2, "0");
		this.sec.value = String(this.time.getSeconds()).padStart(2, "0");
		setInterval( () => self.increaseSec(self), 1000)
	},

	// CLock functions

	increaseSec: (self) => (self.sec.value != 59) ? self.addZero(self.sec) : self.increaseMin(),

	increaseMin: function() {

		if (this.min.value != 59) {
			this.addZero(this.min);
		} else {
			this.increaseHour(this);
			this.min.value = '00';
		}

		this.sec.value = '00';
	},

	increaseHour: (self) => (self.hours.value != 23) ? ++self.hours.value : self.hours.value = 0,

	addZero: (el) => (el.value < 9) ? el.value = `0${++el.value}` : ++el.value,


	//Alarm functions

	initAlarmEvent: self => self.btn.addEventListener('click', () => {
		self.animate();
		self.getDelay(self.convertMs([...self.alarm].reduce( (acc, cur) => acc.concat(cur.value), [])))
	}),
							

	getDelay: function (ms) {
		let closure = this.debounce(this.showPopup, ms);
		closure(this);
	},

	convertMs: function(el) {
		let [h, m, s] = el;
		if(h < this.hours.value) {
			h = (h - this.hours.value) + 24;
		}
		return (h * 3600000 + m * 60000 + s * 1000) - (this.hours.value * 3600000 + this.min.value * 60000 + this.sec.value * 1000);
	},

	showPopup: function(that, self) {
		self.popup.style.display = 'flex';
	},

	debounce: function (func, ms) {
		let timer = null;
		return function (self) {
			const done = function() {
				func(this, self);
				self.audioAlarm();
				timer = null;
			}

			if (timer) {
		      clearTimeout(timer);
		    }

			timer = setTimeout(done, ms);
		}
	},

	closePopup: function(self) {
		this.btnClose.addEventListener('click', function() {
			self.popup.style.display = 'none';
			self.aud.pause();
			self.aud.currentTime = 0.0;
		})
	},

	//Audio

	audioAlarm: function() {
		var promise = this.aud.play();
	},

	// Field validation

	checkAlarmInput: function(self) {
		this.alarm.forEach(el => {
			el.addEventListener('change', function (e) {
				if (self.rules(el.value, e) === 3) {
					self.btn.removeAttribute("disabled");
					self.errorEl.innerText = '';
				} else {
					self.btn.setAttribute("disabled", "true");
					self.errorEl.innerText = 'You have to choose correct time. Example 23:59:59';
				}
			})
		})
	},

	rules: function(val, event) {
		const elements = [...event.target.parentNode.children];
		let count = 0;
		elements.forEach(el => {
			switch (elements.indexOf(el)) {
				case 0:
					(/^(?:1?[0-9]|2[0-3])$/.test(el.value) ? count ++ : count--);
					break;
				case 1:
				case 2:
					(/^([0-5]?[0-9])$/.test(el.value) ? count ++ : count--);
					break;
			}
		})
		return count;
	},

	animate: function() {
		let step = 1;
		document.querySelector('.success').style.opacity = step;
		setTimeout(() => {
			let timer = setInterval(() => {
				if (step <= 0) {
					clearInterval(timer);
					return;
				}

				step -= 0.1;

				document.querySelector('.success').style.opacity = step;
			}, 60)
		}, 1000)
	}
}



clock.init(disabledInputs, alarmInputs, alarmBtn, alarmAudio, popupDiv, errorBlock, btnClosePopup);