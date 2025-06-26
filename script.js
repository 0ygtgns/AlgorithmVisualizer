// --- DOM ELEMENTS ---
const visualizerContainer = document.getElementById('visualizer-container');
const generateArrayBtn = document.getElementById('generate-array-btn');
const stopBtn = document.getElementById('stop-btn');
const sizeSlider = document.getElementById('size-slider');
const speedSlider = document.getElementById('speed-slider');
const sortButtons = document.querySelectorAll('.sort-btn');
const searchButtons = document.querySelectorAll('.search-btn');
const searchInput = document.getElementById('search-input');
const statusDisplayWrapper = document.getElementById('status-display-wrapper');


// --- STATE VARIABLES ---
let array = [];
let originalArray = [];
let arraySize = sizeSlider.value;
let speed = speedSlider.value;
let isRunning = false; // General flag for any running algorithm
let isSorted = false;
let forceStop = false;
let statusContainer, currentAlgorithmDisplay, currentActionDisplay;


// --- HELPER FUNCTIONS ---

const sleep = (ms) => {
    if (forceStop) throw new Error("SortStop");
    const delay = Math.floor(1000 / ms);
    return new Promise(resolve => setTimeout(resolve, delay));
};

const toggleControls = (state) => {
    isRunning = state;
    generateArrayBtn.disabled = state;
    sizeSlider.disabled = state;
    sortButtons.forEach(button => button.disabled = state);
    searchButtons.forEach(button => button.disabled = state);
    searchInput.disabled = state;
};

const setAlgorithmStatus = (message, color = 'var(--accent-color)') => {
    if (currentAlgorithmDisplay) {
        currentAlgorithmDisplay.textContent = message;
        currentAlgorithmDisplay.style.color = color;
    }
};

const setActionStatus = (message = '', color = 'var(--text-color)') => {
    if (currentActionDisplay) {
        currentActionDisplay.innerHTML = message; // Use innerHTML to allow for simple tags like <strong>
        currentActionDisplay.style.color = color;
    }
};

const handleStop = () => {
    forceStop = false;
    isRunning = false;
    array = [...originalArray];
    renderArray(false); // Rerender without isSorted state
    toggleControls(false);
    setAlgorithmStatus('Algorithm Stopped');
    setActionStatus('Select a new algorithm to start.', 'var(--highlight-swap)');
};

// --- ARRAY GENERATION AND RENDERING ---

const generateArray = () => {
    isSorted = false;
    array = [];
    for (let i = 0; i < arraySize; i++) {
        array.push(Math.floor(Math.random() * 95) + 5);
    }
    originalArray = [...array];
    renderArray();
    setAlgorithmStatus('Select an Algorithm');
    setActionStatus('A new array has been generated.');
};

const renderArray = (sorted = false) => {
    visualizerContainer.innerHTML = '';
    // Hide labels if there are too many bars to avoid clutter
    if (array.length > 75) {
        visualizerContainer.classList.add('label-hidden');
    } else {
        visualizerContainer.classList.remove('label-hidden');
    }
    array.forEach(value => {
        const bar = document.createElement('div');
        bar.classList.add('array-bar');
        bar.style.height = `${value}%`;

        const barLabel = document.createElement('span');
        barLabel.classList.add('bar-label');
        barLabel.textContent = value;
        bar.appendChild(barLabel);

        if (sorted || isSorted) {
            bar.classList.add('bar-sorted');
        }
        visualizerContainer.appendChild(bar);
    });
};

const createStatusDisplay = () => {
    statusContainer = document.createElement('div');
    statusContainer.id = 'status-container';
    statusContainer.style.textAlign = 'center';
    
    currentAlgorithmDisplay = document.createElement('h3');
    currentAlgorithmDisplay.style.margin = '0 0 0.25rem 0';
    currentAlgorithmDisplay.style.fontSize = '1.1rem';
    
    currentActionDisplay = document.createElement('p');
    currentActionDisplay.style.margin = '0';
    currentActionDisplay.style.minHeight = '1.2em';
    
    statusContainer.appendChild(currentAlgorithmDisplay);
    statusContainer.appendChild(currentActionDisplay);
    statusDisplayWrapper.appendChild(statusContainer);
};

const initialize = () => {
    createStatusDisplay();
    generateArray();
};


// --- EVENT LISTENERS ---

generateArrayBtn.addEventListener('click', () => { if (!isRunning) { generateArray(); } });
stopBtn.addEventListener('click', () => { if (isRunning) { forceStop = true; } });
sizeSlider.addEventListener('input', (e) => { if (!isRunning) { arraySize = e.target.value; generateArray(); } });
speedSlider.addEventListener('input', (e) => { speed = e.target.value; });

// Main runner for all algorithms
async function runAlgorithm(button) {
    if (isRunning) return;

    forceStop = false;
    
    const isSearch = button.classList.contains('search-btn');
    if (!isSearch) {
        isSorted = false;
        array = [...originalArray];
        renderArray();
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    toggleControls(true);
    const algorithm = button.getAttribute('data-algo');
    const algoName = button.textContent;
    let target = null;
    
    if (isSearch) {
        target = parseInt(searchInput.value, 10);
        if (isNaN(target)) {
            setActionStatus('Please enter a valid number to search for.', 'var(--highlight-swap)');
            toggleControls(false);
            return;
        }
    }

    try {
        switch (algorithm) {
            // Sorting
            case 'bubble': await bubbleSort(algoName); break;
            case 'selection': await selectionSort(algoName); break;
            case 'insertion': await insertionSort(algoName); break;
            case 'merge': await mergeSort(algoName); break;
            case 'quick': await quickSort(algoName); break;
            case 'heap': await heapSort(algoName); break;
            case 'shell': await shellSort(algoName); break;
            case 'cocktail': await cocktailShakerSort(algoName); break;
            case 'pancake': await pancakeSort(algoName); break;
            case 'radix': await radixSort(algoName); break;
            // Searching
            case 'linear': await linearSearch(algoName, target); break;
            case 'binary': await binarySearch(algoName, target); break;
        }

        if (!forceStop) {
            if (!isSearch) {
                isSorted = true;
                await showSortedAnimation();
                setAlgorithmStatus('Sorting Complete!', 'var(--highlight-sorted)');
            }
        }
        
    } catch (error) {
        if (error.message === "SortStop") {
            handleStop();
        } else {
            console.error("An unexpected error occurred:", error);
            handleStop();
        }
    } finally {
        if (!forceStop) {
            toggleControls(false);
        }
    }
}

sortButtons.forEach(button => button.addEventListener('click', () => runAlgorithm(button)));
searchButtons.forEach(button => button.addEventListener('click', () => runAlgorithm(button)));

// --- ALGORITHMS ---

const swapBars = (bar1, bar2) => {
    // Swap height
    const tempHeight = bar1.style.height;
    bar1.style.height = bar2.style.height;
    bar2.style.height = tempHeight;

    // Swap label
    const tempLabel = bar1.querySelector('.bar-label').textContent;
    bar1.querySelector('.bar-label').textContent = bar2.querySelector('.bar-label').textContent;
    bar2.querySelector('.bar-label').textContent = tempLabel;
};

const showSortedAnimation = async () => {
    const bars = document.querySelectorAll('.array-bar');
    for (let i = 0; i < bars.length; i++) {
        await sleep(20);
        if(!bars[i].classList.contains('bar-sorted')) {
             bars[i].classList.add('bar-sorted');
        }
    }
};

// BUBBLE SORT
async function bubbleSort(algoName) {
    setAlgorithmStatus(`Running: ${algoName}`);
    const bars = document.querySelectorAll('.array-bar');
    for (let i = 0; i < array.length - 1; i++) {
        for (let j = 0; j < array.length - i - 1; j++) {
            bars[j].classList.add('bar-compare');
            bars[j + 1].classList.add('bar-compare');
            setActionStatus(`Comparing ${array[j]} & ${array[j + 1]}`);
            await sleep(speed);

            if (array[j] > array[j + 1]) {
                bars[j].classList.add('bar-swap');
                bars[j + 1].classList.add('bar-swap');
                setActionStatus(`Swapping ${array[j]} & ${array[j + 1]}`, 'var(--highlight-swap)');
                await sleep(speed);

                [array[j], array[j + 1]] = [array[j + 1], array[j]];
                swapBars(bars[j], bars[j + 1]);
                await sleep(speed);
            }

            bars[j].classList.remove('bar-compare', 'bar-swap');
            bars[j + 1].classList.remove('bar-compare', 'bar-swap');
        }
        bars[array.length - 1 - i].classList.add('bar-sorted');
    }
    bars[0].classList.add('bar-sorted');
}

// SELECTION SORT
async function selectionSort(algoName) {
    setAlgorithmStatus(`Running: ${algoName}`);
    const bars = document.querySelectorAll('.array-bar');
    for (let i = 0; i < array.length - 1; i++) {
        let minIndex = i;
        bars[i].classList.add('bar-swap'); // Current position to fill

        for (let j = i + 1; j < array.length; j++) {
            setActionStatus('Searching for the minimum element...');
            bars[j].classList.add('bar-compare');
            await sleep(speed);

            if (array[j] < array[minIndex]) {
                if (minIndex !== i) {
                    bars[minIndex].classList.remove('bar-swap');
                }
                minIndex = j;
                bars[minIndex].classList.add('bar-swap'); // New minimum element
            }
            bars[j].classList.remove('bar-compare');
        }

        setActionStatus(`Swapping ${array[i]} & ${array[minIndex]}`, 'var(--highlight-swap)');
        [array[i], array[minIndex]] = [array[minIndex], array[i]];
        swapBars(bars[i], bars[minIndex]);
        await sleep(speed);

        bars[minIndex].classList.remove('bar-swap');
        bars[i].classList.remove('bar-swap');
        bars[i].classList.add('bar-sorted');
    }
    bars[array.length - 1].classList.add('bar-sorted');
}

// INSERTION SORT
async function insertionSort(algoName) {
    setAlgorithmStatus(`Running: ${algoName}`);
    const bars = document.querySelectorAll('.array-bar');
    bars[0].classList.add('bar-sorted');

    for (let i = 1; i < array.length; i++) {
        let key = array[i];
        let keyHeight = bars[i].style.height;
        let j = i - 1;

        bars[i].classList.add('bar-swap'); // Element to be inserted
        setActionStatus(`Placing element ${key} in its correct position`);
        await sleep(speed);

        while (j >= 0 && array[j] > key) {
            array[j + 1] = array[j];
            bars[j + 1].style.height = bars[j].style.height;
            bars[j + 1].querySelector('.bar-label').textContent = array[j + 1];
            j = j - 1;
            await sleep(speed);
        }
        array[j + 1] = key;
        bars[j + 1].style.height = keyHeight;
        bars[j + 1].querySelector('.bar-label').textContent = key;
        
        bars[i].classList.remove('bar-swap');
        for(let k=0; k<=i; k++) {
            bars[k].classList.add('bar-sorted');
        }
        await sleep(speed);
    }
}

// MERGE SORT
async function mergeSort(algoName) {
    setAlgorithmStatus(`Running: ${algoName}`);
    await mergeSortRecursive(0, array.length - 1, algoName);
}

async function mergeSortRecursive(start, end, algoName) {
    if (start >= end) return;
    const mid = Math.floor((start + end) / 2);
    await mergeSortRecursive(start, mid, algoName);
    await mergeSortRecursive(mid + 1, end, algoName);
    await merge(start, mid, end, algoName);
}

async function merge(start, mid, end, algoName) {
    setActionStatus('Merging sub-arrays', 'var(--highlight-compare)');
    const bars = document.querySelectorAll('.array-bar');
    let left = array.slice(start, mid + 1);
    let right = array.slice(mid + 1, end + 1);
    let i = 0, j = 0, k = start;

    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            array[k] = left[i];
            bars[k].style.height = `${left[i]}%`;
            bars[k].querySelector('.bar-label').textContent = left[i];
             i++;
        } else {
            array[k] = right[j];
            bars[k].style.height = `${right[j]}%`; 
            bars[k].querySelector('.bar-label').textContent = right[j];
            j++;
        }
        k++;
        await sleep(speed);
    }
    while (i < left.length) {
        array[k] = left[i];
        bars[k].style.height = `${left[i]}%`; 
        bars[k].querySelector('.bar-label').textContent = left[i];
        i++; k++;
        await sleep(speed);
    }
    while (j < right.length) {
        array[k] = right[j];
        bars[k].style.height = `${right[j]}%`; 
        bars[k].querySelector('.bar-label').textContent = right[j];
        j++; k++;
        await sleep(speed);
    }
}


// QUICK SORT
async function quickSort(algoName) {
    setAlgorithmStatus(`Running: ${algoName}`);
    await quickSortRecursive(0, array.length - 1, algoName);
}

async function quickSortRecursive(low, high, algoName) {
    if (low < high) {
        let pi = await partition(low, high, algoName);
        await quickSortRecursive(low, pi - 1, algoName);
        await quickSortRecursive(pi + 1, high, algoName);
    }
}

async function partition(low, high, algoName) {
    const bars = document.querySelectorAll('.array-bar');
    let pivot = array[high];
    bars[high].classList.add('bar-swap'); // Pivot element
    setActionStatus(`Pivot selected: ${pivot}`);
    let i = low - 1;

    for (let j = low; j < high; j++) {
        bars[j].classList.add('bar-compare');
        await sleep(speed);
        
        if (array[j] < pivot) {
            i++;
            setActionStatus(`Swapping ${array[i]} & ${array[j]}`, 'var(--highlight-swap)');
            [array[i], array[j]] = [array[j], array[i]];
            swapBars(bars[i], bars[j]);
            await sleep(speed);
        }
        bars[j].classList.remove('bar-compare');
    }

    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    swapBars(bars[i + 1], bars[high]);
    await sleep(speed);
    
    bars[high].classList.remove('bar-swap');
    bars[i + 1].classList.add('bar-sorted');

    return i + 1;
}

// HEAP SORT
async function heapSort(algoName) {
    setAlgorithmStatus(`Running: ${algoName}`);
    setActionStatus('Building Max-Heap...');
    const bars = document.querySelectorAll('.array-bar');
    let n = array.length;

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        await heapify(n, i, algoName);
    }

    for (let i = n - 1; i > 0; i--) {
        setActionStatus(`Swapping root with end`, 'var(--highlight-swap)');
        [array[0], array[i]] = [array[i], array[0]];
        swapBars(bars[0], bars[i]);
        bars[i].classList.add('bar-sorted');
        await sleep(speed);
        setActionStatus('Heapifying reduced heap...');
        await heapify(i, 0, algoName);
    }
    bars[0].classList.add('bar-sorted');
}

async function heapify(n, i, algoName) {
    const bars = document.querySelectorAll('.array-bar');
    let largest = i; 
    let left = 2 * i + 1;
    let right = 2 * i + 2; 

    bars[i].classList.add('bar-compare');
    if (left < n) bars[left].classList.add('bar-compare');
    if (right < n) bars[right].classList.add('bar-compare');
    await sleep(speed);

    if (left < n && array[left] > array[largest]) largest = left;
    if (right < n && array[right] > array[largest]) largest = right;

    if (largest !== i) {
        setActionStatus(`Swapping ${array[i]} & ${array[largest]}`, 'var(--highlight-swap)');
        [array[i], array[largest]] = [array[largest], array[i]];
        swapBars(bars[i], bars[largest]);
        await sleep(speed);
        await heapify(n, largest, algoName);
    }

    bars[i].classList.remove('bar-compare');
    if (left < n) bars[left].classList.remove('bar-compare');
    if (right < n) bars[right].classList.remove('bar-compare');
}

// SHELL SORT
async function shellSort(algoName) {
    setAlgorithmStatus(`Running: ${algoName}`);
    const bars = document.querySelectorAll('.array-bar');
    let n = array.length;

    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
        setActionStatus(`Sorting with gap size: ${gap}`);
        await sleep(speed);
        for (let i = gap; i < n; i += 1) {
            let temp = array[i];
            let tempHeight = bars[i].style.height;
            bars[i].classList.add('bar-swap');
            await sleep(speed);
            
            let j;
            for (j = i; j >= gap && array[j - gap] > temp; j -= gap) {
                setActionStatus(`Comparing ${array[j-gap]} & ${temp}`);
                bars[j - gap].classList.add('bar-compare');
                await sleep(speed);
                array[j] = array[j - gap];
                bars[j].style.height = bars[j - gap].style.height;
                bars[j].querySelector('.bar-label').textContent = array[j];
                bars[j - gap].classList.remove('bar-compare');
            }
            array[j] = temp;
            bars[j].style.height = tempHeight;
            bars[j].querySelector('.bar-label').textContent = temp;
            bars[i].classList.remove('bar-swap');
        }
    }
}

// COCKTAIL SHAKER SORT
async function cocktailShakerSort(algoName) {
    setAlgorithmStatus(`Running: ${algoName}`);
    const bars = document.querySelectorAll('.array-bar');
    let swapped = true;
    let start = 0;
    let end = array.length;

    while (swapped) {
        swapped = false;
        setActionStatus('Forward pass');
        for (let i = start; i < end - 1; ++i) {
            bars[i].classList.add('bar-compare');
            bars[i + 1].classList.add('bar-compare');
            await sleep(speed);
            if (array[i] > array[i + 1]) {
                [array[i], array[i + 1]] = [array[i + 1], array[i]];
                swapBars(bars[i], bars[i + 1]);
                swapped = true;
                await sleep(speed);
            }
            bars[i].classList.remove('bar-compare');
            bars[i + 1].classList.remove('bar-compare');
        }
        if (!swapped) break;
        swapped = false;
        end = end - 1;
        bars[end].classList.add('bar-sorted');

        setActionStatus('Backward pass');
        for (let i = end - 1; i >= start; --i) {
            bars[i].classList.add('bar-compare');
            bars[i + 1].classList.add('bar-compare');
            await sleep(speed);
            if (array[i] > array[i + 1]) {
                [array[i], array[i + 1]] = [array[i + 1], array[i]];
                swapBars(bars[i], bars[i + 1]);
                swapped = true;
                await sleep(speed);
            }
            bars[i].classList.remove('bar-compare');
            bars[i + 1].classList.remove('bar-compare');
        }
        start = start + 1;
        bars[start - 1].classList.add('bar-sorted');
    }
}

// PANCAKE SORT
async function pancakeSort(algoName) {
    setAlgorithmStatus(`Running: ${algoName}`);
    let n = array.length;
    for (let curr_size = n; curr_size > 1; --curr_size) {
        let max_idx = findMaxIndex(curr_size);

        if (max_idx !== curr_size - 1) {
            if (max_idx !== 0) {
                 setActionStatus(`Flipping to bring max (${array[max_idx]}) to front`);
                 await flip(max_idx);
            }
            setActionStatus(`Flipping to move max to correct position`);
            await flip(curr_size - 1);
        }
        document.querySelectorAll('.array-bar')[curr_size - 1].classList.add('bar-sorted');
    }
}
function findMaxIndex(n) {
    let max_i = 0;
    for (let i = 0; i < n; ++i) {
        if (array[i] > array[max_i]) {
            max_i = i;
        }
    }
    return max_i;
}
async function flip(i) {
    const bars = document.querySelectorAll('.array-bar');
    let start = 0;
    while (start < i) {
        bars[start].classList.add('bar-swap');
        bars[i].classList.add('bar-swap');
        await sleep(speed);
        [array[start], array[i]] = [array[i], array[start]];
        swapBars(bars[start], bars[i]);
        await sleep(speed);
        bars[start].classList.remove('bar-swap');
        bars[i].classList.remove('bar-swap');
        start++;
        i--;
    }
}

// RADIX SORT
function getMax() {
    return Math.max(...array);
}
async function radixSort(algoName) {
    setAlgorithmStatus(`Running: ${algoName}`);
    const max = getMax();
    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
        await countingSortForRadix(exp);
    }
}
async function countingSortForRadix(exp) {
    const bars = document.querySelectorAll('.array-bar');
    const n = array.length;
    let output = new Array(n).fill(0);
    let count = new Array(10).fill(0);
    const digitPlace = exp === 1 ? '1s' : exp === 10 ? '10s' : `${exp}s`;
    
    setActionStatus(`Distributing elements by <strong>${digitPlace}</strong> digit`);
    for (let i = 0; i < n; i++) {
        const digit = Math.floor(array[i] / exp) % 10;
        count[digit]++;
        bars[i].classList.add('bar-bucket');
        await sleep(speed);
    }
    
    for (let i = 1; i < 10; i++) count[i] += count[i - 1];

    for (let i = n - 1; i >= 0; i--) {
        const digit = Math.floor(array[i] / exp) % 10;
        output[count[digit] - 1] = array[i];
        count[digit]--;
    }

    setActionStatus(`Gathering elements back into array`);
    for (let i = 0; i < n; i++) {
        array[i] = output[i];
        bars[i].style.height = `${array[i]}%`;
        bars[i].querySelector('.bar-label').textContent = array[i];
        bars[i].classList.remove('bar-bucket');
        bars[i].classList.add('bar-compare');
        await sleep(speed);
        bars[i].classList.remove('bar-compare');
    }
}


// SEARCHING ALGORITHMS
async function linearSearch(algoName, target) {
    setAlgorithmStatus(`Running: ${algoName}`);
    const bars = document.querySelectorAll('.array-bar');
    let found = false;

    for (let i = 0; i < array.length; i++) {
        setActionStatus(`Checking index <strong>${i}</strong> (Value: ${array[i]})`);
        bars[i].classList.add('bar-compare');
        await sleep(speed);

        if (array[i] === target) {
            setAlgorithmStatus('Element Found!', 'var(--highlight-found)');
            setActionStatus(`Value <strong>${target}</strong> found at index <strong>${i}</strong>.`);
            bars[i].classList.remove('bar-compare');
            bars[i].classList.add('bar-found');
            found = true;
            break;
        }
        bars[i].classList.remove('bar-compare');
    }

    if (!found) {
        setAlgorithmStatus('Element Not Found');
        setActionStatus(`The value <strong>${target}</strong> is not in the array.`);
    }
}

async function binarySearch(algoName, target) {
    setAlgorithmStatus(`Running: ${algoName}`);
    
    if (!isSorted) {
        setActionStatus('Array is not sorted. Sorting with QuickSort first...');
        await sleep(1500);
        await quickSort('Quick Sort (pre-search)');
        isSorted = true;
        renderArray(true);
    }

    const bars = document.querySelectorAll('.array-bar');
    let low = 0;
    let high = array.length - 1;
    let found = false;

    while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        
        if (low < bars.length) bars[low].classList.add('bar-swap');
        if (high < bars.length) bars[high].classList.add('bar-swap');
        setActionStatus(`Searching between index <strong>${low}</strong> and <strong>${high}</strong>. Checking middle index <strong>${mid}</strong>.`);
        await sleep(speed * 2);

        bars[mid].classList.add('bar-compare');
        await sleep(speed * 2);

        if (array[mid] === target) {
            setAlgorithmStatus('Element Found!', 'var(--highlight-found)');
            setActionStatus(`Value <strong>${target}</strong> found at index <strong>${mid}</strong>.`);
            bars[mid].classList.remove('bar-compare');
            bars[mid].classList.add('bar-found');
            found = true;
            break;
        } else if (array[mid] < target) {
            setActionStatus(`<strong>${array[mid]}</strong> is less than ${target}. Searching right half.`);
            low = mid + 1;
        } else {
            setActionStatus(`<strong>${array[mid]}</strong> is greater than ${target}. Searching left half.`);
            high = mid - 1;
        }
        
        if(low -1 >= 0 && low -1 < bars.length) bars[low-1].classList.remove('bar-swap');
        if(high + 1 < array.length) bars[high+1].classList.remove('bar-swap');
        bars[mid].classList.remove('bar-compare');
        await sleep(speed * 2);
    }
    
    document.querySelectorAll('.array-bar').forEach(b => b.classList.remove('bar-swap'));

    if (!found) {
        setAlgorithmStatus('Element Not Found');
        setActionStatus(`The value <strong>${target}</strong> is not in the array.`);
    }
}

// --- APPLICATION START ---
window.onload = initialize;
