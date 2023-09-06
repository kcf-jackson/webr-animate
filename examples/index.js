// Toggles fullscreen mode
const toggleFullScreen = () => {
    const plot = document.getElementById('plot');
    if (!document.fullscreenElement) {
        plot.requestFullscreen();
    } else {
        document.exitFullscreen && document.exitFullscreen();
    }
}




// Resizable panels
const v_divider = document.getElementById('v-divider');
const h_divider = document.getElementById('h-divider');
const panelLeft = document.querySelector('#terminal');
const panelRight = document.querySelector('#plot');
const container = document.querySelector(".container");
let isResizing = false;


v_divider.addEventListener('mousedown', (e) => {
    isResizing = true;

    document.addEventListener('mousemove', resizeWidth);
    document.addEventListener('mouseup', removeWidthHandle);
});

function resizeWidth(e) {
    if (!isResizing) return;

    // Get the total width of the resizable container
    const containerWidth = container.offsetWidth;

    // Calculate new column sizes as fractions of the container width
    const newLeftWidth = (e.clientX / containerWidth);
    const newRightWidth = 1 - newLeftWidth;

    // Apply the new column sizes as fractions to the grid-template-columns property
    const newColumns = `${newLeftWidth}fr auto ${newRightWidth}fr`;
    container.style.gridTemplateColumns = newColumns;
}

function removeWidthHandle() {
    isResizing = false;
    document.removeEventListener('mousemove', resizeWidth);
    document.removeEventListener('mouseup', removeWidthHandle);
}




h_divider.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.addEventListener('mousemove', resizeHeight);
    document.addEventListener('mouseup', removeHeightHandle);
})

function resizeHeight(e) {
    if (!isResizing) return;

    // Get the total width of the resizable container
    const containerHeight = container.offsetHeight;

    // Calculate new column sizes as fractions of the container width
    const newTopHeight = (e.clientY / containerHeight);
    const newBottomHeight = 1 - newTopHeight;

    // Apply the new column sizes as fractions to the grid-template-columns property
    const newRows = `${newTopHeight}fr auto ${newBottomHeight}fr`;
    container.style.gridTemplateRows = newRows;

    // Resize the terminal
    ieditor.resizeRows();
    term.resizeRows();
}

function removeHeightHandle() {
    is_Resizing = false;
    document.removeEventListener('mousemove', resizeHeight);
    document.removeEventListener('mouseup', removeHeightHandle);
}
