const year_slider = document.getElementById("year-slider")
const year_display =document.getElementById("year-display")


year_slider.addEventListener('input',function(){
    year_display.textContent = year_slider.value
})
year_slider.addEventListener('input',function(){
    year = parseInt(year_slider.value)
    if(year>2025)
        year = 2025
    year_display.textContent = year
})