'use client'

import { useState } from 'react'
import { FileText, ExternalLink } from 'lucide-react'
import '@/features/jobs/styles/Jobs.css'

export function CandidateSidebar() {
    const [jobSearchActive, setJobSearchActive] = useState(true)
    const [profileVisible, setProfileVisible] = useState(true)

    return (
        <div className="topcv-sidebar">
            {/* Widget: Quản lý hồ sơ */}
            <div className="topcv-sidebar__widget">
                <h3 className="topcv-sidebar__widget-title">Quản lý hồ sơ</h3>

                <div className="topcv-sidebar__toggle-row">
                    <span className="topcv-sidebar__toggle-label">Trạng thái tìm việc</span>
                    <button
                        type="button"
                        className={`topcv-toggle ${jobSearchActive ? 'topcv-toggle--active' : ''}`}
                        onClick={() => setJobSearchActive(!jobSearchActive)}
                        aria-label="Bật/tắt trạng thái tìm việc"
                    >
                        <span className="topcv-toggle__knob" />
                    </button>
                </div>

                <div className="topcv-sidebar__toggle-row">
                    <span className="topcv-sidebar__toggle-label">Cho phép NTD tìm kiếm hồ sơ</span>
                    <button
                        type="button"
                        className={`topcv-toggle ${profileVisible ? 'topcv-toggle--active' : ''}`}
                        onClick={() => setProfileVisible(!profileVisible)}
                        aria-label="Bật/tắt cho phép NTD tìm kiếm"
                    >
                        <span className="topcv-toggle__knob" />
                    </button>
                </div>
            </div>

            {/* Banner: CV chuyên nghiệp */}
            <div className="topcv-sidebar__banner">
                <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                    <FileText className="w-10 h-10" style={{ color: '#00b14f' }} />
                </div>
                <h3 className="topcv-sidebar__banner-title">CV chuyên nghiệp</h3>
                <p className="topcv-sidebar__banner-text">
                    Tạo CV ấn tượng với hàng trăm mẫu chuyên nghiệp, chuẩn theo ngành nghề
                </p>
                <button className="topcv-sidebar__banner-button" type="button">
                    Xem ngay
                    <ExternalLink className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
