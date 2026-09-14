const SUPABASE_URL = 'https://bitrshuqaqtdzoeaiuaj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpdHJzaHVxYXF0ZHpvZWFpdWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzNjM3NDQsImV4cCI6MjEwNDkzOTc0NH0.kH0EB6fMY2WqV8EQud22Z-VtuXswuJk22fx1-G9zCJU';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentProfile = 'sollehin'; 
let currentDateStr = '';
let allDailyRecords = {}; 

let dailyGoal = 2500; 
let currentIntake = 0;
let foodEntries = [];
let hydrationHistoryList = [];

// Sidebar Toggle Function
function toggleSidebar() {
    const sidebar = document.getElementById('appSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const isOpen = sidebar.classList.contains('open');

    if (isOpen) {
        sidebar.classList.remove('open');
        overlay.style.display = 'none';
    } else {
        sidebar.classList.add('open');
        overlay.style.display = 'block';
    }
}

// Module Switcher Function
function switchModule(moduleName) {
    const dashboardModule = document.getElementById('dashboardModule');
    const pnlCalendarModule = document.getElementById('pnlCalendarModule');
    const menuItems = document.querySelectorAll('.sidebar-item');

    menuItems.forEach(item => item.classList.remove('active'));

    dashboardModule.style.display = 'none';
    if (pnlCalendarModule) pnlCalendarModule.style.display = 'none';

    if (moduleName === 'pnl') {
        if (pnlCalendarModule) pnlCalendarModule.style.display = 'flex';
        event.currentTarget.classList.add('active');
        setPnlHeader();
        initPnlCalendar();
    } else {
        dashboardModule.style.display = 'grid';
        event.currentTarget.classList.add('active');
        setDashboardHeader();
    }

    toggleSidebar();
}

function setDashboardHeader() {
    const header = document.getElementById('topHeader');
    header.innerHTML = `
        <div class="header-left">
            <i class="fa-solid fa-bars menu-icon" onclick="toggleSidebar()"></i>
            FOOD & WATER INTAKE
        </div>
        <div class="header-right">
            <select id="profileSelect" class="profile-select" onchange="switchProfile()">
                <option value="sollehin" ${currentProfile === 'sollehin' ? 'selected' : ''}>Sollehin</option>
                <option value="syahirah" ${currentProfile === 'syahirah' ? 'selected' : ''}>Syahirah</option>
                <option value="iman_sayf" ${currentProfile === 'iman_sayf' ? 'selected' : ''}>Iman Sayf</option>
            </select>
            <div class="user-avatar" id="userAvatarText">${currentProfile === 'syahirah' ? 'SY' : currentProfile === 'iman_sayf' ? 'IS' : 'SO'}</div>
        </div>
    `;
}

function setPnlHeader() {
    const header = document.getElementById('topHeader');
    header.innerHTML = `
        <div class="header-left">
            <i class="fa-solid fa-bars menu-icon" onclick="toggleSidebar()"></i>
            PNL CALENDAR
        </div>
        <div class="header-right">
            <!-- Account Selector & Actions -->
            <div class="flex items-center gap-1.5 bg-white border border-[#cbd5e1] rounded-xl px-3 py-1.5 shadow-2xs">
                <select id="account-select" onchange="switchAccount(this.value)" class="bg-transparent text-xs sm:text-sm font-semibold text-[#1f2937] focus:outline-none cursor-pointer">
                </select>
                <button onclick="openAddAccountModal()" title="Add Account" class="text-[#407b9e] hover:text-[#2c5975] text-xs px-1.5 py-1 rounded-lg bg-gray-50 border border-[#cbd5e1] transition">
                    <i class="fa-solid fa-plus"></i>
                </button>
                <button onclick="deleteCurrentAccount()" title="Delete Account" class="text-red-500 hover:text-red-600 text-xs px-1.5 py-1 rounded-lg bg-gray-50 border border-[#cbd5e1] transition">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
            <div class="user-avatar" id="userAvatarText">SO</div>
        </div>
    `;
    populateAccountDropdown();
}

function updateProfileSpecifics() {
    const quickAddContainer = document.querySelector('.quick-add-btns');
    if (!quickAddContainer) return;
    if (currentProfile === 'iman_sayf') {
        dailyGoal = 1000; 
        quickAddContainer.innerHTML = `
            <button onclick="addWater(10)">+10ml</button>
            <button onclick="addWater(30)">+30ml</button>
            <button onclick="addWater(120)">+120ml</button>
        `;
    } else {
        dailyGoal = 2500; 
        quickAddContainer.innerHTML = `
            <button onclick="addWater(50)">+50ml</button>
            <button onclick="addWater(250)">+250ml</button>
            <button onclick="addWater(500)">+500ml</button>
            <button onclick="addWater(1000)">+1000ml</button>
        `;
    }
}

function renderBottleTemplate() {
    const wrapper = document.getElementById('bottleContainerWrapper');
    if (!wrapper) return;
    if (currentProfile === 'iman_sayf') {
        wrapper.innerHTML = `
            <svg width="140" height="200" viewBox="0 0 140 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <clipPath id="trainingBottleClip">
                        <path d="M 42 62 H 98 V 136 C 98 141, 94 145, 89 145 H 51 C 46 145, 42 141, 42 136 Z" />
                    </clipPath>
                    <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#93c5fd" />
                        <stop offset="100%" stop-color="#3b82f6" />
                    </linearGradient>
                </defs>
                <g clip-path="url(#trainingBottleClip)">
                    <rect id="svgWater" x="42" y="145" width="56" height="0" fill="url(#waterGradient)" />
                </g>
                <path d="M 42 74 C 15 74, 15 120, 42 126" stroke="#1f2937" stroke-width="3" stroke-linecap="round" fill="none"/>
                <path d="M 98 74 C 125 74, 125 120, 98 126" stroke="#1f2937" stroke-width="3" stroke-linecap="round" fill="none"/>
                <path d="M 42 62 H 98 V 136 C 98 141, 94 145, 89 145 H 51 C 46 145, 42 141, 42 136 Z" fill="none" stroke="#1f2937" stroke-width="3" stroke-linejoin="round"/>
                <path d="M 34 50 H 106 C 109 50, 111 52, 111 55 V 62 C 111 65, 109 67, 106 67 H 34 C 31 67, 29 65, 29 62 V 55 C 29 52, 31 50, 34 50 Z" fill="#ffffff" stroke="#1f2937" stroke-width="3" stroke-linejoin="round"/>
                <path d="M 44 50 V 38 C 44 33, 48 29, 53 29 H 87 C 92 29, 96 33, 96 38 V 50 Z" fill="#ffffff" stroke="#1f2937" stroke-width="3" stroke-linejoin="round"/>
                <path d="M 52 29 L 46 13 C 45 10, 48 8, 51 10 L 59 29 Z" fill="#ffffff" stroke="#1f2937" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
            </svg>
        `;
    } else {
        wrapper.innerHTML = `
            <svg width="140" height="200" viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <clipPath id="bottleClip">
                        <path d="M 23 46 H 77 V 138 C 77 143, 73 147, 68 147 H 32 C 27 147, 23 143, 23 138 Z" />
                    </clipPath>
                    <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#93c5fd" />
                        <stop offset="100%" stop-color="#3b82f6" />
                    </linearGradient>
                </defs>
                <g clip-path="url(#bottleClip)">
                    <rect id="svgWater" x="23" y="147" width="54" height="0" fill="url(#waterGradient)" />
                </g>
                <rect x="40" y="8" width="20" height="10" rx="3" fill="#ffffff" stroke="#1f2937" stroke-width="3" stroke-linejoin="round"/>
                <path d="M 43 18 H 57 C 62 18, 65 25, 70 32 C 74 38, 77 42, 77 46 V 138 C 77 143, 73 147, 68 147 H 32 C 27 147, 23 143, 23 138 V 46 C 23 42, 26 38, 30 32 C 35 25, 38 18, 43 18 Z" fill="none" stroke="#1f2937" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    }
}

function switchProfile() {
    const selectEl = document.getElementById('profileSelect');
    currentProfile = selectEl.value;

    let initials = "SO";
    if (currentProfile === 'syahirah') {
        initials = "SY";
    } else if (currentProfile === 'iman_sayf') {
        initials = "IS";
    }

    const avatarText = document.getElementById('userAvatarText');
    if (avatarText) avatarText.innerText = initials;

    updateProfileSpecifics();
    renderBottleTemplate();
    loadData();
}

async function loadData() {
    currentDateStr = new Date().toLocaleDateString('en-CA'); 
    currentIntake = 0;
    foodEntries = [];
    hydrationHistoryList = [];
    allDailyRecords = {};

    try {
        const { data } = await supabaseClient
            .from('tracker_data')
            .select('*')
            .eq('profile', currentProfile)
            .single();
        
        if (data && data.daily_records) {
            allDailyRecords = data.daily_records;
        }
    } catch (err) {
        console.log('Initializing history record for profile:', currentProfile);
    }
    
    if (allDailyRecords[currentDateStr]) {
        foodEntries = allDailyRecords[currentDateStr].food_entries || [];
        currentIntake = allDailyRecords[currentDateStr].water_intake || 0;
        hydrationHistoryList = allDailyRecords[currentDateStr].water_history || [];
    }

    updateWaterUI();
    renderHydrationHistoryFromStorage();
    renderSchedule();
}

async function saveData() {
    allDailyRecords[currentDateStr] = {
        food_entries: foodEntries,
        water_intake: currentIntake,
        water_history: hydrationHistoryList
    };

    await supabaseClient
        .from('tracker_data')
        .upsert({
            profile: currentProfile,
            daily_records: allDailyRecords,
            updated_at: new Date()
        }, { onConflict: 'profile' });
}

function updateWaterUI() {
    if (currentIntake < 0) currentIntake = 0;

    const ratio = currentIntake / dailyGoal; 
    const liters = (currentIntake / 1000).toFixed(1); 
    const goalLiters = (dailyGoal / 1000).toFixed(1);
    const percentage = Math.round(ratio * 100);

    let visualRatio = ratio;
    if (visualRatio > 1.1) visualRatio = 1.1; 

    let cavityBottom = 147;
    let maxCavityHeight = 101;
    if (currentProfile === 'iman_sayf') {
        cavityBottom = 145;
        maxCavityHeight = 83;
    }

    const waterHeight = visualRatio * maxCavityHeight;
    const waterY = cavityBottom - waterHeight;

    const svgWater = document.getElementById('svgWater');
    if (svgWater) {
        svgWater.setAttribute('height', waterHeight);
        svgWater.setAttribute('y', waterY);
    }

    const amountText = document.getElementById('amountText');
    if (amountText) amountText.innerText = `${liters}L / ${goalLiters}L`;
    
    const infoText = document.getElementById('infoText');
    if (infoText) {
        infoText.innerHTML = `
            <strong>TODAY'S GOAL:</strong>
            ${goalLiters} Liters<br><br>
            <strong>CURRENT:</strong>
            ${liters} L (${percentage}%)
        `;
    }

    const indicatorEl = document.getElementById('goalIndicator');
    if (indicatorEl) {
        if (currentIntake >= dailyGoal) {
            const extraMl = currentIntake - dailyGoal;
            indicatorEl.style.display = 'block';
            if (extraMl > 0) {
                indicatorEl.className = 'goal-badge overfilled';
                indicatorEl.innerHTML = `<i class="fa-solid fa-fire"></i> Target Reached! (+${extraMl}ml Extra)`;
            } else {
                indicatorEl.className = 'goal-badge reached';
                indicatorEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> Daily Goal Achieved!`;
            }
        } else {
            indicatorEl.style.display = 'none';
        }
    }
}

function addWater(amount) {
    currentIntake += amount;
    
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    hydrationHistoryList.unshift({ time: timeString, amount: amount });
    saveData();
    updateWaterUI();
    renderHydrationHistoryFromStorage();
}

function removeHydrationItem(index) {
    const removed = hydrationHistoryList.splice(index, 1)[0];
    if (removed) {
        currentIntake -= removed.amount;
    }
    saveData();
    updateWaterUI();
    renderHydrationHistoryFromStorage();
}

function renderHydrationHistoryFromStorage() {
    const historyList = document.getElementById('hydrationHistory');
    if (!historyList) return;
    historyList.innerHTML = '';

    hydrationHistoryList.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        historyItem.innerHTML = `
            <span class="history-time">${item.time}</span>
            <div class="history-right">
                <span class="history-amount">+${item.amount}ml</span>
                <button class="btn-delete" title="Delete record" onclick="removeHydrationItem(${index})">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
        historyList.appendChild(historyItem);
    });
}

function openFoodModal() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('foodTime').value = `${hours}:${minutes}`;
    
    document.getElementById('foodSelect').selectedIndex = 0;
    document.getElementById('customFoodGroup').style.display = 'none';
    document.getElementById('customFoodName').value = '';
    document.getElementById('foodDetails').value = '';
    document.getElementById('foodCalories').value = '';

    document.getElementById('foodModal').style.display = 'flex';
}

function closeFoodModal() {
    document.getElementById('foodModal').style.display = 'none';
    document.getElementById('foodForm').reset();
    document.getElementById('customFoodGroup').style.display = 'none';
}

function onFoodDropdownChange() {
    const selectEl = document.getElementById('foodSelect');
    const customGroup = document.getElementById('customFoodGroup');

    if (selectEl.value === 'custom') {
        customGroup.style.display = 'block';
        document.getElementById('customFoodName').required = true;
    } else {
        customGroup.style.display = 'none';
        document.getElementById('customFoodName').required = false;
    }
}

function handleFoodSubmit(event) {
    event.preventDefault();
    const selectEl = document.getElementById('foodSelect');
    let foodName = selectEl.value;

    if (foodName === 'custom') {
        foodName = document.getElementById('customFoodName').value;
    }

    const foodDetails = document.getElementById('foodDetails').value.trim();
    const foodTime = document.getElementById('foodTime').value;
    let foodCalories = document.getElementById('foodCalories').value.trim();
    
    let calorieText = foodCalories ? `${foodCalories} kcal` : '';

    foodEntries.push({ 
        name: foodName, 
        details: foodDetails, 
        time: foodTime, 
        calories: calorieText 
    });
    
    foodEntries.sort((a, b) => a.time.localeCompare(b.time));

    saveData();
    renderSchedule();
    closeFoodModal();
}

function getTimeDifference(time1, time2) {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    
    let minutes1 = h1 * 60 + m1;
    let minutes2 = h2 * 60 + m2;
    
    let diff = minutes2 - minutes1;
    if (diff < 0) diff += 24 * 60;
    
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    
    if (hours === 0) return `${minutes}m gap`;
    if (minutes === 0) return `${hours}h gap`;
    return `${hours}h ${minutes}m gap`;
}

function renderSchedule() {
    const scheduleList = document.getElementById('scheduleList');
    if (!scheduleList) return;
    scheduleList.innerHTML = '';

    if (foodEntries.length === 0) {
        scheduleList.classList.add('empty');
        scheduleList.innerHTML = '<div style="color: var(--text-light); text-align: center; font-size: 14px;">No food intake added yet. Click below to add.</div>';
        return;
    } else {
        scheduleList.classList.remove('empty');
    }

    foodEntries.forEach((entry, index) => {
        const group = document.createElement('div');
        group.className = 'schedule-item-group';

        let metaInfo = [];
        if (entry.calories) metaInfo.push(entry.calories);

        let metaString = metaInfo.length > 0 ? `(${metaInfo.join(', ')})` : '';

        let detailsHtml = entry.details ? `<span class="food-details-subtext"><i class="fa-solid fa-circle-info" style="margin-right: 4px;"></i>${entry.details}</span>` : '';

        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.innerHTML = `
            <span class="time-label">${entry.time}</span>
            <div class="food-entry-tag">
                <div>
                    <span><i class="fa-solid fa-utensils" style="margin-right: 6px;"></i> <strong>${entry.name}</strong> ${metaString}</span>
                    ${detailsHtml}
                </div>
                <button class="btn-delete-food" onclick="removeFood(${index})" title="Delete entry">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
        group.appendChild(slot);

        if (index < foodEntries.length - 1) {
            const nextEntry = foodEntries[index + 1];
            const gapText = getTimeDifference(entry.time, nextEntry.time);
            
            const gapIndicator = document.createElement('div');
            gapIndicator.className = 'time-gap-indicator';
            gapIndicator.innerHTML = `<i class="fa-regular fa-clock"></i> ${gapText}`;
            group.appendChild(gapIndicator);
        }

        scheduleList.appendChild(group);
    });
}

function removeFood(index) {
    foodEntries.splice(index, 1);
    saveData();
    renderSchedule();
}

// --- PnL Calendar Module Logic ---
let pnlAppData = JSON.parse(localStorage.getItem('pnl_app_data')) || {
    accounts: {
        "Main Account": { data: {}, goals: {} }
    },
    currentAccount: "Main Account",
    showWeekends: true
};

function savePnlAppData() {
    localStorage.setItem('pnl_app_data', JSON.stringify(pnlAppData));
}

function getCurrentAccount() {
    if (!pnlAppData.accounts[pnlAppData.currentAccount]) {
        pnlAppData.currentAccount = Object.keys(pnlAppData.accounts)[0] || "Main Account";
    }
    return pnlAppData.accounts[pnlAppData.currentAccount];
}

let pnlCurrentDate = new Date();
let selectedPnlDateStr = '';

function initPnlCalendar() {
    populateAccountDropdown();
    updateWeekendButtonUI();
    renderPnlCalendar();
    updatePnlSummary();
    updatePnlGoalDisplay();
}

function populateAccountDropdown() {
    const select = document.getElementById('account-select');
    if (!select) return;
    select.innerHTML = '';
    Object.keys(pnlAppData.accounts).forEach(accName => {
        const opt = document.createElement('option');
        opt.value = accName;
        opt.innerText = accName;
        if (accName === pnlAppData.currentAccount) opt.selected = true;
        select.appendChild(opt);
    });
}

function switchAccount(accName) {
    pnlAppData.currentAccount = accName;
    savePnlAppData();
    renderPnlCalendar();
    updatePnlSummary();
    updatePnlGoalDisplay();
}

function openAddAccountModal() {
    const input = document.getElementById('modal-account-input');
    if (input) input.value = '';
    const modal = document.getElementById('account-modal');
    if (modal) modal.style.display = 'flex';
}

function closeAddAccountModal() {
    const modal = document.getElementById('account-modal');
    if (modal) modal.style.display = 'none';
}

function createAccount() {
    const input = document.getElementById('modal-account-input');
    if (!input) return;
    const name = input.value.trim();
    if (name && !pnlAppData.accounts[name]) {
        pnlAppData.accounts[name] = { data: {}, goals: {} };
        pnlAppData.currentAccount = name;
        savePnlAppData();
        populateAccountDropdown();
        closeAddAccountModal();
        renderPnlCalendar();
        updatePnlSummary();
        updatePnlGoalDisplay();
    } else if (pnlAppData.accounts[name]) {
        alert('Account name already exists.');
    }
}

function deleteCurrentAccount() {
    const accountKeys = Object.keys(pnlAppData.accounts);
    if (accountKeys.length <= 1) {
        alert("You cannot delete the last remaining account.");
        return;
    }
    if (confirm(`Are you sure you want to delete the account "${pnlAppData.currentAccount}"? All its data and goals will be lost.`)) {
        delete pnlAppData.accounts[pnlAppData.currentAccount];
        pnlAppData.currentAccount = Object.keys(pnlAppData.accounts)[0];
        savePnlAppData();
        populateAccountDropdown();
        renderPnlCalendar();
        updatePnlSummary();
        updatePnlGoalDisplay();
    }
}

function toggleWeekends() {
    pnlAppData.showWeekends = !pnlAppData.showWeekends;
    savePnlAppData();
    updateWeekendButtonUI();
    renderPnlCalendar();
}

function updateWeekendButtonUI() {
    const btnText = document.getElementById('weekend-btn-text');
    if (btnText) {
        btnText.innerText = pnlAppData.showWeekends ? "Hide Weekends" : "Show Weekends";
    }
}

function renderPnlCalendar() {
    const year = pnlCurrentDate.getFullYear();
    const month = pnlCurrentDate.getMonth();

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const displayEl = document.getElementById('month-year-display');
    if (displayEl) displayEl.innerText = `${months[month]} ${year}`;

    const totalDays = new Date(year, month + 1, 0).getDate();
    const grid = document.getElementById('calendar-grid');
    const daysHeader = document.getElementById('days-header');
    if (!grid || !daysHeader) return;

    const accData = getCurrentAccount().data;
    grid.innerHTML = '';

    if (pnlAppData.showWeekends) {
        daysHeader.className = "grid grid-cols-7 gap-2 text-center text-xs font-bold text-[#4b5563]";
        daysHeader.innerHTML = `<div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>`;
        grid.className = "grid grid-cols-7 gap-2";

        const firstDayIndex = new Date(year, month, 1).getDay();
        for (let i = 0; i < firstDayIndex; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'min-h-[100px] sm:min-h-[120px] bg-white/30 rounded-xl opacity-20 border border-transparent';
            grid.appendChild(emptyCell);
        }

        for (let day = 1; day <= totalDays; day++) {
            const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            appendPnlDayCell(grid, day, dayStr, accData);
        }
    } else {
        daysHeader.className = "grid grid-cols-5 gap-2 text-center text-xs font-bold text-[#4b5563]";
        daysHeader.innerHTML = `<div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div>`;
        grid.className = "grid grid-cols-5 gap-2";

        let firstRenderedDayOfWeek = null;
        for (let day = 1; day <= totalDays; day++) {
            let d = new Date(year, month, day).getDay();
            if (d !== 0 && d !== 6) {
                firstRenderedDayOfWeek = (d === 0 ? 6 : d - 1);
                break;
            }
        }

        if (firstRenderedDayOfWeek !== null) {
            for (let i = 0; i < firstRenderedDayOfWeek; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.className = 'min-h-[100px] sm:min-h-[120px] bg-white/30 rounded-xl opacity-20 border border-transparent';
                grid.appendChild(emptyCell);
            }
        }

        for (let day = 1; day <= totalDays; day++) {
            let d = new Date(year, month, day).getDay();
            if (d === 0 || d === 6) continue;
            const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            appendPnlDayCell(grid, day, dayStr, accData);
        }
    }
}

function appendPnlDayCell(grid, day, dayStr, accData) {
    const cell = document.createElement('div');
    cell.className = 'min-h-[100px] sm:min-h-[120px] bg-white border border-[#cbd5e1] rounded-xl p-2.5 flex flex-col justify-between cursor-pointer hover:border-[#407b9e] transition relative overflow-hidden shadow-2xs';
    cell.onclick = () => openPnlModal(dayStr);

    let entry = accData[dayStr];
    let pnlHtml = '';
    let notesHtml = '';
    let bgStyle = '';

    if (entry !== undefined && entry.pnl !== '') {
        const val = parseFloat(entry.pnl);
        if (val > 0) {
            bgStyle = 'bg-emerald-50 border-emerald-300';
            pnlHtml = `<span class="text-sm sm:text-base font-bold text-emerald-600">+$${val.toFixed(2)}</span>`;
        } else if (val < 0) {
            bgStyle = 'bg-red-50 border-red-300';
            pnlHtml = `<span class="text-sm sm:text-base font-bold text-red-500">-$${Math.abs(val).toFixed(2)}</span>`;
        } else {
            pnlHtml = `<span class="text-sm sm:text-base font-bold text-gray-400">$0.00</span>`;
        }
        cell.className += ` ${bgStyle}`;

        if (entry.notes && entry.notes.trim() !== '') {
            notesHtml = `<span class="text-[10px] sm:text-xs text-gray-600 font-medium truncate max-w-[95%] px-1.5 py-0.5 bg-white/80 rounded mt-1 shadow-2xs border border-gray-100">${entry.notes}</span>`;
        }
    }

    cell.innerHTML = `
        <div class="flex justify-between items-start">
            <span class="text-xs text-[#4b5563] font-semibold">${day}</span>
        </div>
        <div class="flex flex-col items-center justify-center flex-1 my-1">
            ${pnlHtml}
            ${notesHtml}
        </div>
    `;
    grid.appendChild(cell);
}

function changeMonth(direction) {
    pnlCurrentDate.setMonth(pnlCurrentDate.getMonth() + direction);
    renderPnlCalendar();
    updatePnlSummary();
    updatePnlGoalDisplay();
}

function openPnlModal(dateStr) {
    selectedPnlDateStr = dateStr;
    const titleEl = document.getElementById('modal-date-title');
    if (titleEl) titleEl.innerText = `Date: ${dateStr}`;
    
    const accData = getCurrentAccount().data;
    const entry = accData[dateStr] || { pnl: '', notes: '' };
    
    const pnlInput = document.getElementById('modal-pnl-input');
    const notesInput = document.getElementById('modal-notes-input');
    if (pnlInput) pnlInput.value = entry.pnl;
    if (notesInput) notesInput.value = entry.notes || '';

    const modal = document.getElementById('pnl-modal');
    if (modal) modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('pnl-modal');
    if (modal) modal.style.display = 'none';
}

function savePnL() {
    const pnlVal = document.getElementById('modal-pnl-input').value;
    const notesVal = document.getElementById('modal-notes-input').value;
    const accData = getCurrentAccount().data;

    if (pnlVal === '') {
        delete accData[selectedPnlDateStr];
    } else {
        accData[selectedPnlDateStr] = {
            pnl: parseFloat(pnlVal),
            notes: notesVal
        };
    }

    savePnlAppData();
    closeModal();
    renderPnlCalendar();
    updatePnlSummary();
    updatePnlGoalDisplay();
}

function deletePnL() {
    const accData = getCurrentAccount().data;
    delete accData[selectedPnlDateStr];
    savePnlAppData();
    closeModal();
    renderPnlCalendar();
    updatePnlSummary();
    updatePnlGoalDisplay();
}

function openGoalModal() {
    const year = pnlCurrentDate.getFullYear();
    const month = pnlCurrentDate.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const acc = getCurrentAccount();
    const goalVal = acc.goals && acc.goals[monthKey] ? acc.goals[monthKey] : '';

    const goalInput = document.getElementById('modal-goal-input');
    if (goalInput) goalInput.value = goalVal;

    const modal = document.getElementById('goal-modal');
    if (modal) modal.style.display = 'flex';
}

function closeGoalModal() {
    const modal = document.getElementById('goal-modal');
    if (modal) modal.style.display = 'none';
}

function saveGoal() {
    const val = document.getElementById('modal-goal-input').value;
    const year = pnlCurrentDate.getFullYear();
    const month = pnlCurrentDate.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    
    const acc = getCurrentAccount();
    if (!acc.goals) acc.goals = {};

    if (val === '' || parseFloat(val) <= 0) {
        delete acc.goals[monthKey];
    } else {
        acc.goals[monthKey] = parseFloat(val);
    }

    savePnlAppData();
    closeGoalModal();
    updatePnlGoalDisplay();
}

function updatePnlSummary() {
    const year = pnlCurrentDate.getFullYear();
    const month = pnlCurrentDate.getMonth();
    const accData = getCurrentAccount().data;
    
    let totalPnL = 0;
    let wins = 0;
    let losses = 0;
    let bestDay = 0;

    Object.keys(accData).forEach(dateStr => {
        const [y, m] = dateStr.split('-').map(Number);
        if (y === year && (m - 1) === month) {
            const val = parseFloat(accData[dateStr].pnl);
            if (!isNaN(val)) {
                totalPnL += val;
                if (val > 0) {
                    wins++;
                    if (val > bestDay) bestDay = val;
                } else if (val < 0) {
                    losses++;
                }
            }
        }
    });

    const totalTrades = wins + losses;
    const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : 0;

    const totalEl = document.getElementById('summary-total');
    if (totalEl) {
        totalEl.innerText = (totalPnL >= 0 ? '+' : '') + `$${totalPnL.toFixed(2)}`;
        totalEl.className = `text-lg sm:text-xl font-bold mt-2 ${totalPnL >= 0 ? 'text-emerald-600' : 'text-red-500'}`;
    }

    const winrateEl = document.getElementById('summary-winrate');
    if (winrateEl) winrateEl.innerText = `${winRate}%`;

    const wlEl = document.getElementById('summary-w-l');
    if (wlEl) wlEl.innerText = `${wins} / ${losses}`;
    
    const bestEl = document.getElementById('summary-best');
    if (bestEl) bestEl.innerText = `+$${bestDay.toFixed(2)}`;
}

function updatePnlGoalDisplay() {
    const year = pnlCurrentDate.getFullYear();
    const month = pnlCurrentDate.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    
    const acc = getCurrentAccount();
    const goal = (acc.goals && acc.goals[monthKey]) ? acc.goals[monthKey] : 0;

    let totalPnL = 0;
    Object.keys(acc.data).forEach(dateStr => {
        const [y, m] = dateStr.split('-').map(Number);
        if (y === year && (m - 1) === month) {
            const val = parseFloat(acc.data[dateStr].pnl);
            if (!isNaN(val)) totalPnL += val;
        }
    });

    let percent = 0;
    if (goal > 0) {
        percent = Math.max(0, Math.min(100, (totalPnL / goal) * 100));
    }

    const statusEl = document.getElementById('goal-text-status');
    if (statusEl) statusEl.innerText = `$${totalPnL.toFixed(2)} / $${goal.toFixed(2)} (${percent.toFixed(1)}%)`;

    const barEl = document.getElementById('goal-progress-bar');
    if (barEl) barEl.style.width = `${percent}%`;
}

window.onload = () => {
    updateProfileSpecifics();
    renderBottleTemplate();
    loadData();
};