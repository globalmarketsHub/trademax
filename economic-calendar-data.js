(function disableEconomicCalendarFallback(){
  if (typeof events !== 'undefined') {
    events.splice(0, events.length);
  }
  if (typeof renderEvents === 'function') {
    renderEvents();
  }
})();
