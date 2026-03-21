export interface PortfolioItem {
  id: string
  siteName: string
  siteRole: string
  siteUrl: string
  siteImageUrl: string
  useTech: string[]
  description: string
  createdAt: Date
  updatedAt: Date
}

export interface CreatePortfolioDto {
  siteName: string
  siteRole: string
  siteUrl: string
  siteImageUrl: string
  useTech: string[]
  description: string
}

export type UpdatePortfolioDto = Partial<CreatePortfolioDto>
