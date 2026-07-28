import { useState } from 'react'
import { Screen, ScreenHeader, SegmentedControl } from '../../components/ui'
import AccountsTab from './accounts-tab'
import BudgetsTab from './budgets-tab'
import CategoriesTab from './categories-tab'

const TABS = [
  { value: 'accounts', label: 'Accounts' },
  { value: 'budgets', label: 'Budgets' },
  { value: 'categories', label: 'Categories' },
]

export default function WalletScreen() {
  const [tab, setTab] = useState('accounts')

  return (
    <Screen>
      <ScreenHeader />
      <div className="pt-6">
        <SegmentedControl fullWidth options={TABS} value={tab} onChange={setTab} />
      </div>

      <div className="pt-6">
        {tab === 'accounts' && <AccountsTab />}
        {tab === 'budgets' && <BudgetsTab />}
        {tab === 'categories' && <CategoriesTab />}
      </div>
    </Screen>
  )
}
