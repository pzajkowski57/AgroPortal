export type Role = 'user' | 'company' | 'admin' | 'vet'

export type ListingStatus = 'active' | 'expired' | 'sold' | 'draft' | 'rejected'

export type ListingCondition = 'new' | 'used' | 'for_parts'

export type CompanyStatus = 'pending' | 'verified' | 'rejected' | 'suspended'

export type SubscriptionTier = 'none' | 'basic' | 'premium'

export type ExchangeCategory =
  | 'zboze'
  | 'rzepak'
  | 'kukurydza'
  | 'buraki'
  | 'ziemniaki'
  | 'warzywa'
  | 'owoce'
  | 'inne'
