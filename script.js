// Supabase Configuration
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

// Module Switcher Function (Dashboard vs Calendar)
function switchModule(moduleName) {
    const dashboardModule = document.getElementById('dashboardModule');
    const calendarModule = document.getElementById('calendarModule');
    const menuItems = document.querySelectorAll('.sidebar-item');

    menuItems.forEach(item => item.classList.remove('active'));

    if (moduleName === 'calendar') {
        dashboardModule.style.display = 'none';
        calendarModule.style.display = 'block';
        event.currentTarget.classList.add('active');
        
        // Set default date picker value to today
        const datePicker = document.getElementById('historyDateSelect');
        if (!datePicker.value) {
            datePicker.value = currentDateStr || new Date().toLocaleDateString('en-CA');
            loadHistoricalRecordForDate(datePicker.value);
        }
    } else {
        calendarModule.style.display = 'none';
        dashboardModule.style.display = 'grid';
        event.currentTarget.classList.add('active');
    }

    toggleSidebar(); // Close sidebar after clicking
}

// Load and inspect past records for any chosen date in the calendar module
function loadHistoricalRecordForDate(selectedDate) {
    const container = document.getElementById('calendarDayContent');
    const dayData = allDailyRecords[selectedDate];

    if (!dayData || (!dayData.food_entries?.length && !dayData.water_history?.length)) {
        container.innerHTML = `<p style="color: var(--text-light); text-align: center; padding: 20px;">No records found for ${selectedDate}.</p>`;
        return;
    }

    let foodHtml = dayData.food_entries?.map(f => `
        <div style="background: #e0f2fe; padding: 8px 12px; border-radius: 10px; margin-bottom: 6px; font-size: 13px; display: flex; justify-content: space-between;">
            <span><strong>${f.time}</strong> - ${f.name} ${f.calories ? `(${f.calories})` : ''}</span>
            <span style="color: var(--text-light);">${f.details || ''}</span>
        </div>
    `).join('') || '<p style="font-size:13px; color:var(--text-light);">No food logged.</p>';

    let waterHtml = dayData.water_history?.map(w => `
        <div style="background: #f0fdf4; padding: 6px 12px; border-radius: 8px; margin-bottom: 4px; font-size: 13px; display: flex; justify-content: space-between;">
            <span>${w.time}</span>
            <span style="font-weight:600; color: #16a34a;">+${w.amount}ml</span>
        </div>
    `).join('') || '<p style="font-size:13px; color:var(--text-light);">No water logged.</p>';

    const totalWaterLiters = ((dayData.water_intake || 0) / 1000).toFixed(1);

    container.innerHTML = `
        <div style="margin-bottom: 15px;">
            <h4 style="font-size: 15px; margin-bottom: 8px; color: var(--header-bg);"><i class="fa-solid fa-utensils"></i> Food Intake (${selectedDate})</h4>
            ${foodHtml}
        </div>
        <div>
            <h4 style="font-size: 15px; margin-bottom: 8px; color: #0ea5e9;"><i class="fa-solid fa-droplet"></i> Water Total: ${totalWaterLiters}L</h4>
            ${waterHtml}
        </div>
    `;
}

function updateProfileSpecifics() {
    const quickAddContainer = document.querySelector('.quick-add-btns');
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
            <button onclick="addWater(250)">+250ml</button>
            <button onclick="addWater(500)">+500ml</button>
            <button onclick="addWater(1000)">+1000ml</button>
        `;
    }
}

function renderBottleTemplate() {
    const wrapper = document.getElementById('bottleContainerWrapper');
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

    let profileName = "SOLLEHIN";
    let initials = "SO";
    if (currentProfile === 'syahirah') {
        profileName = "SYAHIRAH";
        initials = "SY";
    } else if (currentProfile === 'iman_sayf') {
        profileName = "IMAN SAYF";
        initials = "IS";
    }

    document.getElementById('userAvatarText').innerText = initials;

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
        const { data, error } = await supabaseClient
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

    document.getElementById('amountText').innerText = `${liters}L / ${goalLiters}L`;
    
    document.getElementById('infoText').innerHTML = `
        <strong>TODAY'S GOAL:</strong>
        ${goalLiters} Liters<br><br>
        <strong>CURRENT:</strong>
        ${liters} L (${percentage}%)
    `;

    const indicatorEl = document.getElementById('goalIndicator');
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

window.onload = () => {
    updateProfileSpecifics();
    renderBottleTemplate();
    loadData();
};