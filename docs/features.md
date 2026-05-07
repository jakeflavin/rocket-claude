# Features 

This documents describes planned features, tasks for the feature, and their current status. 


## Account Management

The Account Management feature provides a desktop-first interface for viewing and editing financial accounts that were generated from external AI-processed bank statements.

The system is strictly **read + edit of existing accounts only**:

- No account creation
- No deletion (only merge or edit)
- No net worth calculations in this module
- No transaction-level editing here

Accounts are displayed as structured metadata containers tied to transaction data.

### Pages

Two feature folders are introduced:

```
features/
  account-overview/
  account-management/
```

#### 1. Account Overview Page

A high-level dashboard view of all accounts, focused on quick financial context and navigation into transactions.

Layout:
- Desktop-first layout
- Main content area shows grouped accounts
- Right-side collapsible panel for account actions/details

Sections: 
Accounts are grouped into static categories.
- Checking Accounts
- Savings Accounts
- Credit Cards

Features:
- View list of all accounts
- View per-account balance
- View available balance (where applicable)
- Display currency per account (no conversion)
- Group accounts by type (static grouping)
- Click account to navigate to transaction page
- Quick visual status (positive/negative balance indicators)

Interactions:

- Click account → navigates to transaction page with pre-filter:
  - account_id injected into query params
- Expand/collapse account groups
- Open side panel for account details preview

#### 2. Account Management Page

A dedicated management interface for correcting and maintaining AI-generated account data.

Layout:
- Desktop-first
- Side panel (right) is primary interaction area
- Main panel shows selectable account list

Account Editing Feature:
- Edit account name
- Edit account type (checking, savings, credit card)
- Edit institution name
- Edit balance (manual correction only)
- Edit currency (display only; no conversion logic)
- Edit visibility (hide/show account)

Account Merging Feature:
- Used when AI incorrectly creates duplicate accounts.

Merge Behavior Feature:
- Select two or more accounts
- Choose primary account (surviving record)
- Merge all transactions under primary account_id
- Combine balances (rule-based reconciliation)
- Preserve metadata from primary account
- Archive merged accounts (not deleted)

Merge Constraints Feature:
- Must preserve transaction integrity
- Must maintain referential integrity across:
  - transactions.csv
  - account_balance_history.csv
  - recurring_transactions.csv

Interactions: 
- Select account → opens editable panel
- Multi-select accounts → enables merge action
- Save changes → updates accounts.csv
- Merge action → rewrites account_id references in dependent CSVs

### Tasks

- [x] Account Overview Page - Build grouped account UI (checking/savings/credit cards)
- [x] Account Overview Page - Render account balances and metadata
- [x] Account Overview Page - Implement click-to-transaction navigation (query param routing)
- [x] Account Overview Page - Add account type grouping logic
- [x] Account Overview Page - Add right-side collapsible detail panel
- [x] Account Overview Page - Add visual balance indicators (positive/negative/zero)
- [x] Account Management Page - Build account list selector UI
- [x] Account Management Page - Build account edit form panel
- [x] Account Management Page - Implement account update logic (CSV write)
- [x] Account Management Page - Implement account type editing
- [x] Account Management Page - Implement institution editing
- [x] Account Management Page - Implement visibility toggle (hide/show account)
- [x] Account Management Page - build multi-select account UI
- [x] Account Merge System - Multi-account selection system
- [x] Account Merge System - Primary account selection UI
- [x] Account Merge System - Merge preview screen (what changes will occur)
- [x] Account Merge System - Merge execution logic:
  - Update transactions.csv account_id references
  - Update account_balance_history.csv references
  - Update recurring_transactions.csv references
- [x] Account Merge System - Archive merged accounts safely (soft state in CSV)
- [x] Data Integrity Layer - Prevent orphaned transactions after merges
- [x] Data Integrity Layer - Validate account_id consistency across datasets
- [x] Data Integrity Layer - Rebuild DuckDB views after updates
- [ ] Data Integrity Layer - Detect duplicate accounts heuristically (optional hook)
- [x] Navigation & Integration - Link accounts → transaction page with filters
- [x] Navigation & Integration - Sync updates between overview and management pages
- [x] Navigation & Integration - Ensure sidebar panel state persistence

## Categories & Tags Overview 
The Categories & Tags feature provides users with a centralized interface for organizing, categorizing, and analyzing transaction data.

This feature is responsible for:
* Category management
* Subcategory hierarchy management
* Tag management
* Spending analysis by category
* Categorization rule management

This feature also defines the categorization rules used by the future Claude Skill ingestion pipeline when processing bank statements into transaction CSV data.

The categorization system is strictly limited to:

* 2-level category nesting
* Parent categories
* Single-level subcategories

Rules are only applied during future imports and are not retroactively executed against existing transaction data.

### Pages

Two feature folders are introduced:
```
features/
  categories-tags-overview/
  category-rules-management/
```

#### 1. Categories & Tags Overview Page

A desktop-first analytics and management interface for categories, subcategories, and tags.

This page acts as:
* a spending visualization dashboard
* a category management system
* a transaction categorization interface

Layout:
* Desktop-first layout
* Main content area contains category analytics and category lists
* Right-side collapsible panel for editing categories, subcategories, and tags
* Transaction recategorization tools integrated into category views

Sections:
* Spending by Category
* Spending by Subcategory
* Category List
* Subcategory List
* Tags List
* Uncategorized Transactions

Features:
* View spending by category
* View spending by subcategory
* View filterable category spending charts
* Create custom categories
* Create subcategories
* Rename categories
* Rename subcategories
* Delete categories
* Delete subcategories
* Set category icons
* Set category colors
* Create and manage tags
* Set tag colors
* View uncategorized transactions
* Manually categorize transactions
* Move transactions between categories
* Move transactions between subcategories

Interactions:
* Click category → filters analytics and transactions
* Click subcategory → filters analytics and transactions
* Select transaction(s) → assign category/subcategory
* Select transaction(s) → assign/remove tags
* Open side panel → edit category metadata
* Expand/collapse category groups

Constraints:
* Maximum category depth is 2 levels
* Subcategories cannot contain children
* Deleting a parent category promotes all subcategories upward
* Deleting a category removes category assignments from related transactions
* Tags only contain:
    * name
    * color

#### 2. Category Rules Management Page

A dedicated interface for managing categorization rules used during AI-assisted bank statement ingestion.

Rules are evaluated during future imports only.

Layout:
* Desktop-first layout
* Rule list in main panel
* Right-side collapsible rule editor panel

Rule Matching Fields:
* Merchant
* Description

Rule Operators:
* Contains
* Equals
* Starts With

Features:
* Create categorization rules
* Edit categorization rules
* Delete categorization rules
* Enable/disable rules
* Assign category targets
* Assign subcategory targets
* Assign tags
* Set rule priority ordering
* Preview rule behavior

Rule Priority Behavior:
* Highest priority rule wins
* Rules stop evaluating after first successful match

Interactions:
* Select rule → open editor panel
* Drag/drop rules → reorder priority
* Save rule → updates rules.csv
* Toggle rule → enable/disable execution

Constraints:
* Rules are not retroactive
* Rules only apply during future imports
* Rules only support merchant/description matching
* Rules cannot create categories automatically

### Tasks
- [x] Categories Overview Page - Build category analytics dashboard
- [x] Categories Overview Page - Build category spending charts
- [x] Categories Overview Page - Build subcategory spending charts
- [x] Categories Overview Page - Build category list UI
- [x] Categories Overview Page - Build subcategory hierarchy UI
- [x] Categories Overview Page - Build tags management UI
- [x] Categories Overview Page - Build uncategorized transaction section
- [x] Categories Overview Page - Implement category filtering
- [x] Categories Overview Page - Implement subcategory filtering
- [x] Categories Overview Page - Implement transaction recategorization
- [x] Categories Overview Page - Implement bulk transaction categorization
- [x] Categories Overview Page - Implement tag assignment/removal
- [x] Categories Overview Page - Implement category color editing
- [x] Categories Overview Page - Implement category icon editing
- [x] Categories Overview Page - Implement category rename functionality
- [x] Categories Overview Page - Implement subcategory rename functionality
- [x] Categories Overview Page - Implement category deletion behavior
- [x] Categories Overview Page - Implement subcategory promotion logic
- [x] Categories Overview Page - Implement category expand/collapse behavior
- [x] Categories Overview Page - Add right-side collapsible editing panel
- [x] Category Rules Management Page - Build rules list UI
- [x] Category Rules Management Page - Build rule editor panel
- [x] Category Rules Management Page - Implement merchant matching rules
- [x] Category Rules Management Page - Implement description matching rules
- [x] Category Rules Management Page - Implement contains operator
- [x] Category Rules Management Page - Implement equals operator
- [x] Category Rules Management Page - Implement starts with operator
- [x] Category Rules Management Page - Implement category assignment logic
- [x] Category Rules Management Page - Implement subcategory assignment logic
- [x] Category Rules Management Page - Implement tag assignment logic
- [x] Category Rules Management Page - Implement rule priority ordering
- [x] Category Rules Management Page - Implement drag/drop priority UI
- [x] Category Rules Management Page - Implement rule enable/disable toggle
- [x] Category Rules Management Page - Implement rule deletion
- [x] Category Rules Management Page - Implement rule preview functionality
- [x] Data Integrity Layer - Validate category_id consistency
- [x] Data Integrity Layer - Validate subcategory hierarchy integrity
- [x] Data Integrity Layer - Prevent orphaned subcategories
- [x] Data Integrity Layer - Validate transaction tag relationships
- [x] Data Integrity Layer - Rebuild DuckDB analytical views after updates
- [x] Navigation & Integration - Link categories → filtered transaction views
- [x] Navigation & Integration - Sync category updates across analytics views
- [x] Navigation & Integration - Persist sidebar panel state

===

## Category Rules

A sub page should be added under transactions, and accessed through the side panel, where users should be able to set and create rules for categorization. These rules will be used when the Claude Skill (not yet implemented) ingests bank statements and fills out the transaction data. 

For this feature to be completed users should be able to do the following:
- Creand and update rules for categorization 
- Enable/disable rules

## Subscriptions & Bills
A new reoccurring page needs added that displays recorring transactions. This should be a sub page to transactions. Users should be able to see their reoccuring bills and subscriptions in different views (list, calendar). 

For this feature to be completed users should be able to do the following:
- Subscription detection
- Recurring income detection
- Bill reminders
- Upcoming payment calendar
- Frequency detection
- Confidence scoring
- Subscription spending summaries
- Cancelled subscription tracking

## Spending Analytics
A new page is needed where users can see their spending in filterable graphical represenation. This should be a sub page on transactions. 

For this feature to be completed users should be able to do the following:
- Monthly spending trends
- Yearly spending trends
- Spending by merchant
- Income vs expenses
- Average monthly spending
- Savings rate calculations
- Cash flow tracking

## Budgets
A new page is needed where users should be able to create and manage budgets. Users should be able to see and create budgets on this page. 

For this feature to be completed users should be able to do the following:
- Create onthly budgets
- Creat weekly budgets
- Apply custom budget periods
- Apply category budgets
- Rollover budgets for periods
- Budget progress tracking via progress charts
- Budget alerts/warnings
- Remaining budget calculations
- Overspending detection

## Goals
A new goals page should be added htat allows users to set and manage savings goals. 

For this feature to be completed users should be able to do the following:
- Savings targets
- Goal progress tracking
- Target date tracking
- Linked account tracking
- Contribution recommendations

## Home Dashboard
Users should be presents with a dashboard as their main screen when opening the app. It should include:
- Account balances overview
- Spending summary
- Monthly cash flow
- Budget progress
- Recent transactions
- Upcoming bills
- Savings goals summary

