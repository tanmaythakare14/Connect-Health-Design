import type { ConnectionApiDto, ConnectionUsageApiDto } from '../@types';

/** MOCK licence usage, matching the current console ("20 of 40 connections used"). */
export const MOCK_CONNECTION_USAGE: ConnectionUsageApiDto = {
  used: 20,
  limit: 40,
};

/**
 * MOCK data for the Connections table, served by service/api.ts until the
 * real endpoint exists. Delete this file once listConnections() calls the API.
 */
export const MOCK_CONNECTIONS: ConnectionApiDto[] = [
  {
    id: '3fe85399-4a93-4c1e-9b2d-7a1f0c6e5d21',
    source: 'epic',
    name: 'coh 947',
    type: 'standalone',
    status: 'active',
  },
  {
    id: 'ad23312e-317d-4b8a-a5f0-2c9e8d7b6a13',
    source: 'epic',
    name: 'Test delete',
    type: 'standalone',
    status: 'draft',
  },
  {
    id: '3c63a8dc-a0f5-4e27-8d14-5b6c9f2e1a08',
    source: 'epic',
    name: 'Test SMART',
    type: 'embed',
    status: 'inactive',
  },
  {
    id: '3914ea89-f5cb-4a6d-b0e3-8c2f7d1e9b54',
    source: 'opendental',
    name: 'coh 723 new opendental',
    type: 'opendental',
    status: 'active',
  },
  {
    id: '1cb5db13-bcef-4f92-a7d8-3e6b1c0a5f47',
    source: 'epic',
    name: 'coh 723 new standalone epic',
    type: 'standalone',
    status: 'draft',
  },
  {
    id: '1bb926ca-438f-4d05-9c6e-2a8f5b7d3e19',
    source: 'veradigm',
    name: 'coh 723 all script unity',
    type: 'unity',
    status: 'inactive',
  },
  {
    id: '7d2e4f81-9a3c-4b67-8e15-0f4c2b9a6d38',
    source: 'epic',
    name: 'Riverside Health backend sync',
    type: 'backend',
    status: 'active',
  },
  {
    id: 'b84c0e57-2d19-4a83-b6f4-9e1d7c3a5b62',
    source: 'epic',
    name: 'Northwind clinic embed',
    type: 'embed',
    status: 'draft',
  },
  {
    id: '5a9f3d26-e7b1-4c48-a2d9-6b0e8f4c1a73',
    source: 'opendental',
    name: 'Lakeview Dental',
    type: 'opendental',
    status: 'inactive',
  },
  {
    id: 'e61b8c42-5f07-4d3a-9b8e-1c7a2d6f0e95',
    source: 'veradigm',
    name: 'Unity scheduling feed',
    type: 'unity',
    status: 'active',
  },
  {
    id: '92c4a7e3-0b6d-4f15-8a29-d3e5f1b7c046',
    source: 'epic',
    name: 'coh 812 patient lookup',
    type: 'standalone',
    status: 'draft',
  },
  {
    id: '0f7e2b9d-c4a1-4e86-b3d5-7a9c6e2f1b84',
    source: 'epic',
    name: 'Mercy General labs backend',
    type: 'backend',
    status: 'active',
  },
  {
    id: 'c3d81f6a-7e24-4b9c-a0f5-2e8b4d1c9a37',
    source: 'epic',
    name: 'Provider portal SMART launch',
    type: 'embed',
    status: 'draft',
  },
  {
    id: '68a5e0c9-1f3b-4d72-9e46-b5c2a8f7d013',
    source: 'opendental',
    name: 'Brightsmile orthodontics',
    type: 'opendental',
    status: 'inactive',
  },
  {
    id: 'f2b9d4e7-6a08-4c51-b7e3-0d1f5c9a2e68',
    source: 'veradigm',
    name: 'coh 734 unity eRx',
    type: 'unity',
    status: 'draft',
  },
  {
    id: '4e07c1a8-b952-4f3d-8c6a-e9d2b7f0a514',
    source: 'epic',
    name: 'Cardiology referrals',
    type: 'standalone',
    status: 'draft',
  },
  {
    id: 'a96d2f35-8c7e-4b10-a4d9-3f6e1b8c0d72',
    source: 'epic',
    name: 'Nightly encounters export',
    type: 'backend',
    status: 'active',
  },
  {
    id: '2b5e8a14-d3f6-4c97-b0a2-7e9c4f1d6b85',
    source: 'epic',
    name: 'Patient intake embed',
    type: 'embed',
    status: 'draft',
  },
  {
    id: 'd0c7f9b2-4a6e-4e38-9d15-8b3a2c7e5f60',
    source: 'opendental',
    name: 'Harbor Family Dentistry',
    type: 'opendental',
    status: 'draft',
  },
  {
    id: '81f3a6d5-e2c9-4b74-a8e0-5d7b9c1f3a26',
    source: 'veradigm',
    name: 'Unity medication history',
    type: 'unity',
    status: 'draft',
  },
  {
    id: '6c4e1b97-3f8d-4a25-b9c6-0e2d7a5f8b13',
    source: 'epic',
    name: 'coh 901 test standalone',
    type: 'standalone',
    status: 'draft',
  },
  {
    id: 'ef28d5c1-9b4a-4f60-8e73-a1c6b3d9e047',
    source: 'epic',
    name: 'Claims backend pipeline',
    type: 'backend',
    status: 'inactive',
  },
  {
    id: '37b9a0e6-c5d2-4e81-a6f4-9d8e2b1c7f35',
    source: 'epic',
    name: 'MyChart companion embed',
    type: 'embed',
    status: 'draft',
  },
  {
    id: '9e6f4c38-a1b7-4d29-b5e0-c8f3d2a6e791',
    source: 'opendental',
    name: 'Summit Dental Group',
    type: 'opendental',
    status: 'draft',
  },
];
