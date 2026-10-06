-- Bring the tab titled "REC-TAB ..." to the front at the recording size
-- (window 1512x949 at the top-left => 1512x772 viewport).
tell application "Google Chrome"
  set found to "no"
  repeat with w in windows
    repeat with j from 1 to count of tabs of w
      if title of tab j of w starts with "REC-TAB" then
        set active tab index of w to j
        set index of w to 1
        set bounds of w to {0, 33, 1512, 982}
        set found to "yes"
      end if
    end repeat
  end repeat
  activate
  return found
end tell
