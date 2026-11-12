import { dateDaysAgo, dateKey, emptyAsset } from './assets'
import type { Asset, AssetInput } from './assets'

const devices: Array<[string, AssetInput['type'], string, string, number | null, Partial<AssetInput>?]> = [
  ['Outreach Laptop 03', 'Laptop', 'Windows 11', 'Outreach', 14, { patch: 'Overdue', notes: 'Used for off-site enrollment. Arrange an update window after the next intake session.' }],
  ['Finance Desktop 01', 'Desktop', 'Windows 11', 'Finance', 8, { notes: 'Office workstation for grant and budget reporting.' }],
  ['Volunteer Tablet 02', 'Mobile', 'iPadOS', 'Volunteer Services', null, { endpoint: 'Unknown', backup: 'Unknown' }],
  ['Intake Laptop 01', 'Laptop', 'Windows 11', 'Client Services', 25, { endpoint: 'Missing', backup: 'Disabled' }],
  ['Operations Laptop 02', 'Laptop', 'macOS', 'Operations', 6],
  ['Shared File Server', 'Server', 'Ubuntu LTS', 'IT Support', 116],
  ['Training Desktop 02', 'Desktop', 'Windows 11', 'Programs', 33],
  ['Warehouse Laptop 01', 'Laptop', 'ChromeOS', 'Food Distribution', 37, { backup: 'Unknown' }],
  ['Guest Wi-Fi Gateway', 'Network', 'Managed firmware', 'Facilities', 19, { patch: 'Overdue' }],
  ['Donor Relations Laptop', 'Laptop', 'macOS', 'Development', 22],
  ['Reception Desktop', 'Desktop', 'Windows 11', 'Administration', 9],
  ['Community Room Tablet', 'Mobile', 'Android', 'Programs', 32, { backup: 'Disabled' }],
  ['Admin Laptop 04', 'Laptop', 'Windows 11', 'Administration', 18],
  ['Donation Portal Server', 'Server', 'Debian', 'IT Support', 41, { endpoint: 'Unknown' }],
  ['Distribution Phone 01', 'Mobile', 'Android', 'Food Distribution', 11],
  ['Archive Workstation', 'Desktop', 'Windows 11', 'Finance', 122, { patch: 'Overdue', backup: 'Disabled' }],
  ['Main Office Switch', 'Network', 'Managed firmware', 'Facilities', 40],
  ['Check-in Kiosk', 'Other', 'ChromeOS Flex', 'Client Services', 16],
]

export function makeDemoAssets(today = dateKey()): Asset[] {
  return devices.map(([name, type, os, owner, age, overrides], index) => ({
    ...emptyAsset, name, type, os, owner,
    endpoint: 'Enabled',
    patch: 'Up to date',
    backup: 'Enabled',
    reviewed: age === null ? '' : dateDaysAgo(today, age),
    ...overrides,
    id: `demo-${index + 1}`,
    demo: true,
  }))
}
