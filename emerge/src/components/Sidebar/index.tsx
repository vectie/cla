import { ipcRenderer } from 'electron'
import type { ProgressInfo } from 'electron-updater'
import { useCallback, useEffect, useState } from 'react'
import styles from './Sidebar.module.scss'

const Sidebar = () => {
    return (
        <div className={styles.sidebar}>
            <div className="server-list">
                {/* Server list elements */}
            </div>
            <div className="channel-list">
                {/* Channel list elements */}
            </div>
        </div>
    );
};

export default Sidebar
