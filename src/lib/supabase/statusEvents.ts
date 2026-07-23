export type DataSourceNoticeTone = 'success' | 'warning'

export type DataSourceNoticeDetail = {
  endpoint: string
  title: string
  message: string
  tone: DataSourceNoticeTone
}

export const DATA_SOURCE_NOTICE_EVENT = 'app:data-source-notice'

export function emitDataSourceNotice(detail: DataSourceNoticeDetail) {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent<DataSourceNoticeDetail>(DATA_SOURCE_NOTICE_EVENT, { detail }))
}

