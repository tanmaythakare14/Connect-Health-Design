import type {
  Connection,
  ConnectionApiDto,
  ConnectionUsage,
  ConnectionUsageApiDto,
  EhrSystem,
  EhrSystemApiDto,
} from '../@types';
import { EHR_AVAILABILITY } from '../constants';

export function apiDtoToEhrSystem(dto: EhrSystemApiDto): EhrSystem {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    monogram: dto.monogram,
    capabilities: dto.capabilities,
    isAvailable: dto.availability === EHR_AVAILABILITY.AVAILABLE,
  };
}

export function apiDtoToConnection(dto: ConnectionApiDto): Connection {
  return {
    id: dto.id,
    source: dto.source,
    name: dto.name,
    type: dto.type,
    status: dto.status,
  };
}

export function apiDtoToConnectionUsage(
  dto: ConnectionUsageApiDto,
): ConnectionUsage {
  return {
    used: dto.used,
    limit: dto.limit,
  };
}
