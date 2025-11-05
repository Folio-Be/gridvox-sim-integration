/**
 * Racing simulator definitions
 * Contains metadata for detecting popular racing simulators
 */

import { SimulatorDefinition } from '../types';

export const SIMULATORS: SimulatorDefinition[] = [
  // iRacing
  {
    id: 'iracing',
    name: 'iRacing',
    executable: 'iRacingSim64DX11.exe',
    steamAppId: '266410',
    knownPaths: ['iRacing'],
    userDataPath: 'iRacing',
    alternativeExecutables: ['iRacingSim.exe', 'iRacingService.exe'],
  },

  // Assetto Corsa
  {
    id: 'assetto-corsa',
    name: 'Assetto Corsa',
    executable: 'acs.exe',
    steamAppId: '244210',
    knownPaths: ['assettocorsa', 'Assetto Corsa'],
    userDataPath: 'Assetto Corsa',
  },

  // Assetto Corsa Competizione
  {
    id: 'assetto-corsa-competizione',
    name: 'Assetto Corsa Competizione',
    executable: 'AC2.exe',
    steamAppId: '805550',
    knownPaths: ['Assetto Corsa Competizione'],
    userDataPath: 'Assetto Corsa Competizione',
    alternativeExecutables: ['AC2-Win64-Shipping.exe'],
  },

  // Assetto Corsa EVO
  {
    id: 'assetto-corsa-evo',
    name: 'Assetto Corsa EVO',
    executable: 'game/AssettoCorsaEVO.exe',
    steamAppId: '2410320',
    knownPaths: [
      'Assetto Corsa Evo',
      'Assetto.Corsa.EVO',
      'Assetto.Corsa.EVO.v0.3.3',
      'AssettoCorsaEVO'
    ],
    userDataPath: 'Assetto Corsa Evo',
    alternativeExecutables: ['AssettoCorsaEVO.exe', 'ACEvo.exe'],
  },

  // rFactor 2
  {
    id: 'rfactor2',
    name: 'rFactor 2',
    executable: 'rFactor2.exe',
    steamAppId: '365960',
    knownPaths: ['rfactor2', 'rFactor 2'],
    userDataPath: 'rFactor 2',
  },

  // Automobilista 2
  {
    id: 'automobilista2',
    name: 'Automobilista 2',
    executable: 'AMS2.exe',
    steamAppId: '1066890',
    knownPaths: ['Automobilista 2'],
    userDataPath: 'Automobilista 2',
    alternativeExecutables: ['AMS2AVX.exe'],
  },

  // BeamNG.drive
  {
    id: 'beamng',
    name: 'BeamNG.drive',
    executable: 'BeamNG.drive.x64.exe',
    steamAppId: '284160',
    knownPaths: ['BeamNG.drive'],
    userDataPath: 'BeamNG.drive',
    alternativeExecutables: ['BeamNG.drive.exe'],
  },

  // RaceRoom Racing Experience
  {
    id: 'raceroom',
    name: 'RaceRoom Racing Experience',
    executable: 'RRRE.exe',
    steamAppId: '211500',
    knownPaths: ['raceroom racing experience', 'RaceRoom'],
    userDataPath: 'RaceRoom',
  },

  // Project CARS 2
  {
    id: 'project-cars-2',
    name: 'Project CARS 2',
    executable: 'pCARS2.exe',
    steamAppId: '378860',
    knownPaths: ['Project CARS 2'],
    userDataPath: 'Project CARS 2',
    alternativeExecutables: ['pCARS2AVX.exe'],
  },

  // Project CARS
  {
    id: 'project-cars',
    name: 'Project CARS',
    executable: 'pCARS.exe',
    steamAppId: '234630',
    knownPaths: ['Project CARS'],
    userDataPath: 'Project CARS',
    alternativeExecutables: ['pCARSAVX.exe'],
  },

  // DiRT Rally 2.0
  {
    id: 'dirt-rally-2',
    name: 'DiRT Rally 2.0',
    executable: 'dirtrally2.exe',
    steamAppId: '690790',
    knownPaths: ['DiRT Rally 2.0'],
    userDataPath: 'DiRT Rally 2.0',
  },

  // Richard Burns Rally
  {
    id: 'richard-burns-rally',
    name: 'Richard Burns Rally',
    executable: 'RichardBurnsRally_SSE.exe',
    steamAppId: '1222370', // Steam re-release
    knownPaths: ['Richard Burns Rally', 'RichardBurnsRally'],
    userDataPath: 'Richard Burns Rally',
    alternativeExecutables: [
      'RichardBurnsRally.exe',
      'RichardBurnsRally_NoSSE.exe',
      'RBR Startup.exe',
    ],
  },

  // WRC 9
  {
    id: 'wrc-9',
    name: 'WRC 9',
    executable: 'WRC9.exe',
    steamAppId: '1272320',
    epicAppName: 'Quartz',
    knownPaths: ['WRC9', 'WRC 9'],
  },

  // EA SPORTS WRC
  {
    id: 'ea-wrc',
    name: 'EA SPORTS WRC',
    executable: 'WRC/Binaries/Win64/WRC.exe',
    steamAppId: '1849250',
    epicAppName: 'Chert',
    knownPaths: ['EA SPORTS WRC', 'EA SPORTS WRC/WRC'],
    userDataPath: 'EA SPORTS WRC',
    alternativeExecutables: ['WRC.exe'], // Fallback if in root
  },

  // Le Mans Ultimate
  {
    id: 'le-mans-ultimate',
    name: 'Le Mans Ultimate',
    executable: 'LMU.exe',
    steamAppId: '2399420',
    knownPaths: ['Le Mans Ultimate'],
    userDataPath: 'Le Mans Ultimate',
  },

  // KartKraft
  {
    id: 'kartkraft',
    name: 'KartKraft',
    executable: 'KartKraft.exe',
    steamAppId: '406350',
    knownPaths: ['KartKraft'],
  },

  // F1 25
  {
    id: 'f1-25',
    name: 'F1 25',
    executable: 'F1_25.exe',
    steamAppId: '3059520',
    knownPaths: ['F1 25'],
  },

  // F1 24
  {
    id: 'f1-24',
    name: 'F1 24',
    executable: 'F1_24.exe',
    steamAppId: '2488620',
    epicAppName: 'f1-24',
    knownPaths: ['F1 24'],
  },

  // F1 23
  {
    id: 'f1-23',
    name: 'F1 23',
    executable: 'F1_23.exe',
    steamAppId: '2108330',
    knownPaths: ['F1 23'],
  },

  // F1 22
  {
    id: 'f1-22',
    name: 'F1 22',
    executable: 'F1_22.exe',
    steamAppId: '1692250',
    knownPaths: ['F1 22'],
  },

  // American Truck Simulator (sim racing adjacent)
  {
    id: 'american-truck-simulator',
    name: 'American Truck Simulator',
    executable: 'amtrucks.exe',
    steamAppId: '270880',
    knownPaths: ['American Truck Simulator'],
  },

  // Euro Truck Simulator 2
  {
    id: 'euro-truck-simulator-2',
    name: 'Euro Truck Simulator 2',
    executable: 'eurotrucks2.exe',
    steamAppId: '227300',
    knownPaths: ['Euro Truck Simulator 2'],
  },
];

/**
 * Get simulator definition by ID
 */
export function getSimulatorById(id: string): SimulatorDefinition | undefined {
  return SIMULATORS.find((sim) => sim.id === id);
}

/**
 * Get simulator definition by Steam AppID
 */
export function getSimulatorBySteamAppId(appId: string): SimulatorDefinition | undefined {
  return SIMULATORS.find((sim) => sim.steamAppId === appId);
}

/**
 * Get simulator definition by executable name
 */
export function getSimulatorByExecutable(executable: string): SimulatorDefinition | undefined {
  const lowerExe = executable.toLowerCase();
  return SIMULATORS.find(
    (sim) =>
      sim.executable.toLowerCase() === lowerExe ||
      sim.alternativeExecutables?.some((alt) => alt.toLowerCase() === lowerExe)
  );
}

/**
 * Get simulator definition by Epic App Name
 */
export function getSimulatorByEpicAppName(appName: string): SimulatorDefinition | undefined {
  return SIMULATORS.find((sim) => sim.epicAppName === appName);
}
