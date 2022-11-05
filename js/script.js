// initial data
const guys = {
	'Stas': ['Стас','Стасу'],
	'Leonid': ['Лёня', 'Лёне'],
	'Anton': ['Антоха', 'Антохе'],
	'Kostya': ['Костя', 'Косте'],
	'Gleb': ['Глеб', 'Глебу'],
	'Kolya': ['Колян', 'Коляну'],
}

//render main content
const main_content = document.getElementById('main_content');
const partsContainer = document.createElement('div');
const buttonContainer = document.createElement('div');

partsContainer.className = "parts_container";
buttonContainer.className = "button_container";

Object.keys(shuffleObject(guys)).map((key) => {
	partsContainer.insertAdjacentHTML("afterbegin", `
		<div class="${key}" >
			<div class="check_wrapper">
				<div class="check"></div>
			</div>
			<span class="name">${guys[key][0]}</span>
			<input type="text" class="price" name="${key}" maxlength="6" />  
		</div>
	`)
});
buttonContainer.insertAdjacentHTML("afterbegin", `
	<button disabled>Рассчитать</button>
`)

main_content.append(partsContainer);
main_content.append(buttonContainer);

// add listeners
const partsObjects = document.querySelectorAll('.parts_container > div');
const inputObjects = document.querySelectorAll('input.price');
const buttonObject = document.querySelector('button');

Object.keys(partsObjects).map((el) => {
	partsObjects[el].addEventListener('click', ({ target, currentTarget }) => {
		if (target == currentTarget) {
			with (target) {
				if (!dataset.checked) {
					dataset.checked = 'checked'
					let input = querySelector('input');
					input.focus();
					input.value = input.value || 0;
				} else {
					delete dataset.checked;
				}
			}
			checkButtonAbility();
		}		
	})
});

Object.keys(inputObjects).map((el) => {
	inputObjects[el].addEventListener('input', ({ target }) => {
		with (target) {
			value = value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
			if (value[0] == "0" && value.substring(1).replace(/[^0-9.]/g, '').length > 0)  value = value.substring(1);
		}
		
	})
});

buttonObject.addEventListener('click', ({ target }) => {
	let parts = {};
	const inputsData = document.querySelectorAll('div[data-checked] > input');
	Object.keys(inputsData).map((el) => {
		parts[inputsData[el].name] = Number(inputsData[el].value)
	})
	calcPoxod(parts);
})


// utilities
function shuffleObject(obj) {
	let arr = Object.keys(obj);
	let randomnumber;
	let newObj = {};
	while (Object.keys(newObj).length < arr.length) {
		randomnumber = Math.floor(Math.random() * arr.length);
		newObj[arr[randomnumber]] = obj[arr[randomnumber]];
	}
	return newObj;
}

function checkButtonAbility() {
	const selectedParts = document.querySelectorAll('div[data-checked]');
	buttonObject.disabled = !(selectedParts.length > 1);
}
	
function calcPoxod(parts) {
	const infoContainer = document.getElementById("info_container") || document.createElement('div');
	const infoContainerSummary = document.createElement('div');
	const infoContainerMajor = document.createElement('div');

	let str = "";

	infoContainer.id = "info_container";
	infoContainer.innerHTML = "";

	infoContainer.append(infoContainerSummary);
	infoContainer.append(infoContainerMajor);

	var totalSum = overpaySum = 0;
	var overpayParts = overpayPartsPrc = mustPay = {};

	// Общая сумма
	for (var key of Object.keys(parts)) {
		totalSum += parts[key]
	}
	infoContainerSummary.insertAdjacentHTML("beforeEnd", `<div>Общая сумма: ${totalSum}.</div>`)

	// Среднее с человека
	var partialSum = Math.round(totalSum/Object.keys(parts).length);
	infoContainerSummary.insertAdjacentHTML("beforeEnd", `<div>Среднее с человека: ${partialSum}.</div>`)	

	// Участники переплаты
	str = "";	
	for (var key of Object.keys(parts)) {
		if (parts[key] > partialSum) {
			overpayParts[key] = parts[key] - partialSum;
			str += `${guys[key][0]} - ${overpayParts[key]}, `				
		}
	}
	str && infoContainerSummary.insertAdjacentHTML("beforeEnd", `<div>Переплатили: ${str.slice(0, -2)}.</div>`);	

	// Общая сумма переплаты
	for (var key of Object.keys(parts)) {
		if (parts[key] > partialSum) {
			overpaySum += parts[key] - partialSum;
		}
	}
	infoContainerSummary.insertAdjacentHTML("beforeEnd", `<div>Общая сумма переплаты: ${overpaySum}.</div>`)	

	// Доля каждого участника от общей суммы переплаты
	str = "";
	for (var key of Object.keys(overpayParts)) {
		overpayPartsPrc[key] = Math.round(overpayParts[key]/overpaySum * 10000) / 100
		str += `${guys[key][0]} - ${overpayPartsPrc[key]}%, `
	}
	str && infoContainerSummary.insertAdjacentHTML("beforeEnd", `Доля участников переплаты: <div>${str.slice(0, -2)}.</div>`);

	// Итоговая информация по задолженности
	for (var key of Object.keys(parts)) {
		if (parts[key] < partialSum) {
			mustPay = {}
			diff = partialSum - parts[key]
			str = "";
			for (var key2 of Object.keys(overpayPartsPrc)) {
				mustPay[key2] = Math.round(diff*overpayPartsPrc[key2]/100);
				str += `${guys[key2][1]} - ${mustPay[key2]}, `
			}
			infoContainerMajor.insertAdjacentHTML("beforeEnd", `<div>${guys[key][0]} недоплатил ${diff}. Должен: ${str.slice(0, -2)}.</div>`)
		} else if (parts[key] == partialSum) {
			infoContainerMajor.insertAdjacentHTML("beforeEnd", `<div>${guys[key][0]} никому ничего не должен.</div>`)
		}
	}
	main_content.append(infoContainer);
}


