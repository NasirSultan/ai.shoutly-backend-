import { Industry, SubIndustry, Image } from '@prisma/client'

export type IndustryEntity = Industry & { subIndustries?: SubIndustryEntity[] }

export type SubIndustryEntity = SubIndustry & { images?: Image[] }
