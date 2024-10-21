"use server";
import { sql } from "@vercel/postgres";

export interface UserRankResponse {
  totalPlayers: number;
  rank: number;
  totalMiles: number
}
async function getUserRank(userAddress: string): Promise<UserRankResponse | null> {
  const result = await sql`
    WITH RankedUsers AS (
      SELECT 
        useraddress,
        SUM(miles) as total_miles,
        DENSE_RANK() OVER (ORDER BY SUM(miles) DESC) as rank
      FROM trip
      GROUP BY useraddress
    ),
    TotalPlayers AS (
      SELECT COUNT(DISTINCT useraddress) as total_players
      FROM trip
    )
    SELECT ru.rank, ru.total_miles, tp.total_players
    FROM RankedUsers ru
    CROSS JOIN TotalPlayers tp
    WHERE ru.useraddress = ${userAddress}
  `;

  if (result.rows.length === 0) {
    return null;
  }

  return {
    rank: Number(result.rows[0].rank),
    totalMiles: Number(result.rows[0].total_miles),
    totalPlayers: Number(result.rows[0].total_players)
  };
}

export default getUserRank;