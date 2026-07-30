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

function listLineInfo(line) {
    var m = line.match(/^(\s*)([-*+]|\d+(?:\.\d+)*[.)])(\s+)/);
    if (!m) {
        return null;
    }
    return { indent: m[1].length, contentCol: m[1].length + m[2].length + m[3].length };
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
    $lines = $content.split("\n");
    $firstLine = ($content.slice(0, $blockStart).match(/\n/g) || []).length;
    $lineCount = $content.slice($blockStart, $blockEnd).split("\n").length;
    $firstInfo = null;
    $firstIdx = -1;
    for (var i = $firstLine; i < $firstLine + $lineCount; i++) {
        $firstInfo = listLineInfo($lines[i]);
        if ($firstInfo) {
            $firstIdx = i;
            break;
        }
    }
    if (!$firstInfo) {
        return;
    }

    // the shift is derived from the first list line of the selection and
    // applied to every list line in it, so relative nesting is preserved
    $blockShift = 0;
    $ref = null;
    if (outdent) {
        // align with the nearest list line above at a shallower level,
        // or drop two spaces when there is none
        for (var j = $firstIdx - 1; j >= 0; j--) {
            $ref = listLineInfo($lines[j]);
            if ($ref && $ref.indent < $firstInfo.indent) {
                break;
            }
            $ref = null;
        }
        $blockShift = ($ref ? $ref.indent : Math.max(0, $firstInfo.indent - 2)) - $firstInfo.indent;
    } else {
        // align with the content column of the nearest list line above, so the
        // line becomes its child, or add two spaces when there is none
        for (var j = $firstIdx - 1; j >= 0; j--) {
            $ref = listLineInfo($lines[j]);
            if ($ref) {
                break;
            }
        }
        $blockShift = ($ref ? Math.max($firstInfo.indent, $ref.contentCol) : $firstInfo.indent + 2) - $firstInfo.indent;
    }

    $startShift = 0;
    $totalShift = 0;
    for (var i = $firstLine; i < $firstLine + $lineCount; i++) {
        var info = listLineInfo($lines[i]);
        var shift = 0;
        if (info) {
            shift = Math.max($blockShift, -info.indent);
            $lines[i] = ' '.repeat(info.indent + shift) + $lines[i].slice(info.indent);
        }
        if (i == $firstLine) {
            $startShift = shift;
        }
        $totalShift += shift;
    }
    textarea.val($lines.join("\n"));
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
