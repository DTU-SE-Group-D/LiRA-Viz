import { LatLng, OSMWayId } from '../models';
import { IWay } from '../tables';

/**
 * Constructs the navigation table.
 * The navigation table is a record storing for each way the next and previous ways.
 *
 * @param ways the ways
 *
 * @author Kerbourc'h
 */
export function constructNavigationTable(
  ways: Record<OSMWayId, IWay<LatLng[]>>,
): Record<OSMWayId, { next: OSMWayId[]; prev: OSMWayId[] }> {
  // Create record storing for each way next and previous ways
  let navigationTable: Record<
    OSMWayId,
    { next: OSMWayId[]; prev: OSMWayId[] }
  > = {};

  // Add ways to the navigation table
  for (const WayToAdd of Object.values(ways)) {
    const node_start = WayToAdd.node_start;
    const node_end = WayToAdd.node_end;
    const nodes = [node_start, node_end];

    let next: OSMWayId[] = [];
    let prev: OSMWayId[] = [];

    for (let OSMWayId in navigationTable) {
      const wayFromNavT = ways[OSMWayId];

      // if the roads have a common node
      if (
        nodes.includes(wayFromNavT.node_start) ||
        nodes.includes(wayFromNavT.node_end)
      ) {
        // WayToAdd -> wayFromNavT
        if (node_end === wayFromNavT.node_start) {
          next.push(OSMWayId);
          navigationTable[OSMWayId].prev.push(WayToAdd.osm_id);
        }
        // wayFromNavT -> WayToAdd
        if (wayFromNavT.node_end === node_start) {
          prev.push(OSMWayId);
          navigationTable[OSMWayId].next.push(WayToAdd.osm_id);
        }
      }
    }

    navigationTable[WayToAdd.osm_id] = {
      next: next,
      prev: prev,
    };
  }
  return navigationTable;
}

/**
 * Find the longest branch starting from start.
 * The branch is a list of way ids.
 *
 * @param start the id of the way to start from
 * @param navigationTable the navigation table (see constructNavigationTable)
 * @param ways the ways
 * @param seen the ways already seen (default: [])
 * @returns the longest branch starting from start
 *
 * @author Kerbourc'h
 */
export function findLongestBranch(
  start: OSMWayId,
  navigationTable: Record<OSMWayId, { next: OSMWayId[]; prev: OSMWayId[] }>,
  ways: Record<OSMWayId, IWay<LatLng[]>>,
  seen: OSMWayId[] = [],
): {
  ids: OSMWayId[];
  length: number;
} {
  // find the next way (or undefined if the branch is finished)
  const next_way_ids: OSMWayId[] = navigationTable[start].next.filter(
    (id) => !seen.includes(id),
  );

  // find the longest branch without start
  let longest_branch: { ids: OSMWayId[]; length: number } = {
    ids: [],
    length: 0,
  };
  for (const next_way_id of next_way_ids) {
    // default value of candidate (if the branch is finished)
    let candidate: { ids: OSMWayId[]; length: number } = {
      ids: [next_way_id],
      length: ways[next_way_id].length,
    };

    // find the longest branch starting from next_way_id
    // if the branch is not finished
    if (navigationTable[next_way_id].next.length > 0) {
      const next_seen = [...seen, start];
      candidate = findLongestBranch(
        next_way_id,
        navigationTable,
        ways,
        next_seen,
      );
    }

    if (candidate.length > longest_branch.length) {
      longest_branch = candidate;
    }
  }

  // return the longest branch with the start
  return {
    ids: [start, ...longest_branch.ids],
    length: ways[start].length + longest_branch.length,
  };
}
