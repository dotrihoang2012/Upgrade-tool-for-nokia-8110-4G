# Upgrade Tool for Nokia 8110 4G

<p align="center"><img src="upgrade-tool-src/icons/icon_128.png" width="140"/></p>

A tool to upgrade Nokia 8110 4G from KaiOS 2.5.1 to KaiOS 2.5.4.
### CAUTION: THIS APP IS A CANARY VERSION. TRY AT YOUR RISK.

## Before Install

You must root or jailbreak your device before flashing.

Tutorial: https://sites.google.com/view/bananahackers/home

---

## Requirements

- Nokia 8110 4G (TA-1048 or TA-1059) running KaiOS 2.5.1
- Device must be **jailbroken**
- **ISRG Root X1** certificate must be installed
- At least **50%** battery charge
- **BusyBox** must be present at `/system/bin/busybox`
- Must have a recovery with test-keys (e.g. Gerda Recovery or Philz Touch Recovery)
- **ADB** installed on your computer

---

## Steps to Install

**Step 1 — Open the Upgrade Tool**

Launch the app on your device, then press **OK** on the welcome screen.

**Step 2 — Select Channel**

Choose your preferred channel:
- **Stable** — recommended, latest stable build
- **Canary** — latest pre-release build

Press **SELECT** to confirm.

**Step 3 — Download & Install**

The tool will automatically download and install the selected firmware. Do not turn off or unplug the device during this process.

**Step 4 — Write Recovery Command**

Run the following command on your computer depending on the channel you selected:

**Stable:**
```
adb shell busybox sh -c 'busybox mount -o remount,rw /cache && busybox mkdir -p /cache/recovery && busybox printf "boot-recovery\n--update_package=/sdcard/KaiOS_2.5.4_Stable_v2-signed.zip\n" > /cache/recovery/command'
```

**Canary:**
```
adb shell busybox sh -c 'busybox mount -o remount,rw /cache && busybox mkdir -p /cache/recovery && busybox printf "boot-recovery\n--update_package=/sdcard/KaiOS-2.5.4-v6-signed.zip\n" > /cache/recovery/command'
```

Then go back to the app and press **OK → Yes** to reboot into recovery.

---

## Notes

- Always back up your data before upgrading
- Do not unplug or power off during the upgrade process

---

If you encounter any issues, email: dotrihoang2012@gmail.com
