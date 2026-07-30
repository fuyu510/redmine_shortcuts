function styleSelectedText(textarea, prepend, append) {
    if (append == undefined) {
        append = prepend;
    }

    $start = textarea.prop('selectionStart');
    $end = textarea.prop('selectionEnd');
    $content = textarea.val();
    if ($content.slice(0, $start).endsWith(prepend) && $content.slice($end, $content.length).replace("\n", '').startsWith(append.replace("\n", ''))) {
        $content = $content.slice(0, $start - prepend.length) + $content.slice($start, $end) + $content.slice($end + append.length, $content.length);
        textarea.val($content);
        textarea.focus();
        textarea.prop('selectionStart', $start - prepend.length);
        textarea.prop('selectionEnd', $end - prepend.length);
    } else {
        $content = $content.slice(0, $start) + prepend + $content.slice($start, $end) + append + $content.slice($end, $content.length);
        textarea.val($content);
        textarea.focus();
        textarea.prop('selectionStart', $start + prepend.length);
        textarea.prop('selectionEnd', $end + prepend.length);
    }
}

function indentSelectedListLines(textarea, outdent) {
    $start = textarea.prop('selectionStart');
    $end = textarea.prop('selectionEnd');
    $content = textarea.val();
    $blockStart = $content.lastIndexOf("\n", $start - 1) + 1;
    $blockEnd = $content.indexOf("\n", $end);
    if ($blockEnd == -1) {
        $blockEnd = $content.length;
    }
    $lines = $content.slice($blockStart, $blockEnd).split("\n");
    $listRegex = /^(\s*)([-*+]|\d+[.)])\s/;
    if (!$lines.some(function (line) { return $listRegex.test(line); })) {
        return;
    }

    $startShift = 0;
    $totalShift = 0;
    $lines = $lines.map(function (line, i) {
        var shift = 0;
        if ($listRegex.test(line)) {
            if (outdent) {
                var removed = line.match(/^ {1,2}/);
                if (removed) {
                    shift = -removed[0].length;
                    line = line.slice(-shift);
                }
            } else {
                shift = 2;
                line = '  ' + line;
            }
        }
        if (i == 0) {
            $startShift = shift;
        }
        $totalShift += shift;
        return line;
    });
    $content = $content.slice(0, $blockStart) + $lines.join("\n") + $content.slice($blockEnd);
    textarea.val($content);
    textarea.focus();
    textarea.prop('selectionStart', Math.max($blockStart, $start + $startShift));
    textarea.prop('selectionEnd', Math.max($blockStart, $end + $totalShift));
}

$(document).keydown(function (e) {
    if ($(document.activeElement).hasClass('wiki-edit')) {
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
            // CTRL/CMD + B
            if (e.keyCode == 66) {
                styleSelectedText($(document.activeElement), '**');
                e.preventDefault();
            // CTRL/CMD + S
            } else if (e.keyCode == 83) {
                styleSelectedText($(document.activeElement), '~~');
                e.preventDefault();
            // CTRL/CMD + I
            } else if (e.keyCode == 73) {
                styleSelectedText($(document.activeElement), '*');
                e.preventDefault();
            // CTRL/CMD + L
            } else if (e.keyCode == 76) {
                styleSelectedText($(document.activeElement), '`');
                e.preventDefault();
            // CTRL/CMD + P
            } else if (e.keyCode == 80) {
                styleSelectedText($(document.activeElement), "```\n", "\n```");
                e.preventDefault();
            // CTRL/CMD + ]
            } else if (e.keyCode == 221) {
                indentSelectedListLines($(document.activeElement), false);
                e.preventDefault();
            // CTRL/CMD + [
            } else if (e.keyCode == 219) {
                indentSelectedListLines($(document.activeElement), true);
                e.preventDefault();
            // CTRL/CMD + ENTER
            } else if (e.keyCode == 13) {
                $activeElement = $(document.activeElement)
                $activeElement.blur();
                $('textarea').removeData('changed');
                $activeElement.closest('form').submit();
                e.preventDefault();
            }
        }
    }
});
