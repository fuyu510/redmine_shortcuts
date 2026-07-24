$(document).ready(function () {
    var href = $('a.redmine-shortcuts').attr('href');
    $('a.redmine-shortcuts').attr('onclick', "window.open('" + href + "', 'Redmine Shortcuts', 'width=360,height=520');return false;");
});

$(document).keydown(function (e) {
    if (!$(':focus').is('input') && !$(':focus').is('select') && !$(':focus').is('textarea') && !document.activeElement.isContentEditable) {
        if (!e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
            // S
            if (e.keyCode == 83) {
                $("#q").focus();
                e.preventDefault();
            // 1-9: go to the Nth tab of the main menu, skipping the "+" (new object) button
            } else if (e.key >= '1' && e.key <= '9') {
                var tab = $('#main-menu > ul > li > a').not('#new-object').eq(parseInt(e.key, 10) - 1);
                if (tab.length && tab.attr('href')) {
                    window.location.href = tab.attr('href');
                    e.preventDefault();
                }
            }
        }
    }
});
