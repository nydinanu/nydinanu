import { simpleParser } from 'mailparser'

interface EmailHeader {
  from?: string
  to?: string
  subject?: string
  date?: string
  messageId?: string
  contentType?: string
  dkim?: string
  spf?: string
  dmarc?: string
  replyTo?: string
  cc?: string
  bcc?: string
  [key: string]: string | undefined
}

interface EmailAnalysis {
  headers: EmailHeader
  urls: string[]
  attachments: Array<{
    filename: string
    mimetype: string
    size: number
  }>
  bodyText: string
  bodyHtml: string
}

export async function parseEmailFile(buffer: Buffer): Promise<EmailAnalysis> {
  try {
    const parsed = await simpleParser(buffer)

    // Extract headers
    const headers: EmailHeader = {
      from: parsed.from?.text || 'Unknown',
      to: parsed.to?.text || 'Unknown',
      subject: parsed.subject || '(No Subject)',
      date: parsed.date?.toISOString() || 'Unknown',
      messageId: parsed.messageId || 'Unknown',
      contentType: parsed.contentType || 'Unknown',
      replyTo: parsed.replyTo?.text || undefined,
      cc: parsed.cc?.text || undefined,
      bcc: parsed.bcc?.text || undefined,
    }

    // Extract DKIM, SPF, DMARC from headers
    if (parsed.headers) {
      headers.dkim = parsed.headers.get('dkim-signature') as string | undefined
      headers.spf = parsed.headers.get('received-spf') as string | undefined
      headers.dmarc = parsed.headers.get('authentication-results') as string | undefined
    }

    // Extract URLs from text and HTML
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]*)/g
    const urls = new Set<string>()

    if (parsed.text) {
      const textUrls = parsed.text.match(urlRegex)
      textUrls?.forEach(url => urls.add(url))
    }

    if (parsed.html) {
      const htmlUrls = parsed.html.match(urlRegex)
      htmlUrls?.forEach(url => urls.add(url))
    }

    // Extract attachments
    const attachments = parsed.attachments?.map(attachment => ({
      filename: attachment.filename || 'Unknown',
      mimetype: attachment.contentType || 'application/octet-stream',
      size: attachment.content?.length || 0,
    })) || []

    return {
      headers,
      urls: Array.from(urls),
      attachments,
      bodyText: parsed.text || '',
      bodyHtml: parsed.html || '',
    }
  } catch (error) {
    console.error('[v0] Email parsing error:', error)
    throw new Error(`Failed to parse email file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function extractDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return url
  }
}
