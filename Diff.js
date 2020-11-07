// Diff.js - Diff strings
// (c) Slava Kim
// https://github.com/Slava/diff.js
//

"use strict";

var Diff = {
	// Refer to http://www.xmailserver.org/diff2.pdf

	// Longest Common Subsequence
	// @param A - sequence of atoms - Array
	// @param B - sequence of atoms - Array
	// @param equals - optional comparator of atoms - returns true or false,
	//                 if not specified, triple equals operator is used
	// @returns Array - sequence of atoms, one of LCSs, edit script from A to B
	LCS: function (A, B, /* optional */ equals) {
		// Helpers
		var inRange = function (x, l, r) {
				return (l <= x && x <= r) || (r <= x && x <= l);
			},

			// Takes X-component as argument, diagonal as context,
			// returns array-pair of form x, y
			toPoint = function (x) {
				return [
					x,
					x - this
				]; // XXX context is not the best way to pass diagonal
			},

			// NOTE: all intervals from now on are both sides inclusive
			// Get the points in Edit Graph, one of the LCS paths goes through.
			// The points are located on the same diagonal and represent the middle
			// snake ([D/2] out of D+1) in the optimal edit path in edit graph.
			// @param startA, endA - substring of A we are working on
			// @param startB, endB - substring of B we are working on
			// @returns Array - [
			//                   [x, y], - beginning of the middle snake
			//                   [u, v], - end of the middle snake
			//                    D,     - optimal edit distance
			//                    LCS ]  - length of LCS
			findMidSnake = function (startA, endA, startB, endB) { // eslint-disable-line complexity
				var N = endA - startA + 1,
					M = endB - startB + 1,
					Max = N + M,
					Delta = N - M,
					halfMaxCeil = (Max + 1) / 2 | 0, // eslint-disable-line no-bitwise
					//foundOverlap = false,
					overlap = null,
					// Maps -Max .. 0 .. +Max, diagonal index to endpoints for furthest reaching D-path on current iteration.
					V = {},
					// Same but for reversed paths.
					U = {},
					D, k, x, y, xx, SES, K, i, j;

				// Special case for the base case, D = 0, k = 0, x = y = 0
				V[1] = 0;
				// Special case for the base case reversed, D = 0, k = 0, x = N, y = M
				U[Delta - 1] = N;

				// Iterate over each possible length of edit script
				for (D = 0; D <= halfMaxCeil; D += 1) {
					// Iterate over each diagonal
					for (k = -D; k <= D && !overlap; k += 2) {
						// Positions in sequences A and B of furthest going D-path on diagonal k.
						// Choose from each diagonal we extend
						if (k === -D || (k !== D && V[k - 1] < V[k + 1])) {
							// Extending path one point down, that's why x doesn't change, y
							// increases implicitly
							x = V[k + 1];
						} else {
							// Extending path one point to the right, x increases
							x = V[k - 1] + 1;
						}

						// We can calculate the y out of x and diagonal index.
						y = x - k;

						if (isNaN(y) || x > N || y > M) {
							continue;
						}

						xx = x;
						// Try to extend the D-path with diagonal paths. Possible only if atoms
						// A_x match B_y
						while (x < N && y < M // if there are atoms to compare
							&& equals(A[startA + x], B[startB + y])) {
							x += 1;
							y += 1;
						}

						// We can safely update diagonal k, since on every iteration we consider
						// only even or only odd diagonals and the result of one depends only on
						// diagonals of different iteration.
						V[k] = x;

						// Check feasibility, Delta is checked for being odd.
						if ((Delta & 1) === 1 && inRange(k, Delta - (D - 1), Delta + (D - 1))) { // eslint-disable-line no-bitwise
							// Forward D-path can overlap with reversed D-1-path
							if (V[k] >= U[k]) {
								// Found an overlap, the middle snake, convert X-components to dots
								overlap = [
									xx,
									x
								].map(toPoint, k); // XXX ES5
							}
						}
					}

					if (overlap) {
						SES = D * 2 - 1;
					}

					// Iterate over each diagonal for reversed case
					for (k = -D; k <= D && !overlap; k += 2) {
						// The real diagonal we are looking for is k + Delta
						K = k + Delta;
						if (k === D || (k !== -D && U[K - 1] < U[K + 1])) {
							x = U[K - 1];
						} else {
							x = U[K + 1] - 1;
						}

						y = x - K;
						if (isNaN(y) || x < 0 || y < 0) {
							continue;
						}
						xx = x;
						while (x > 0 && y > 0 && equals(A[startA + x - 1], B[startB + y - 1])) {
							x -= 1;
							y -= 1;
						}
						U[K] = x;

						if (Delta % 2 === 0 && inRange(K, -D, D)) {
							if (U[K] <= V[K]) {
								overlap = [
									x,
									xx
								].map(toPoint, K); // XXX ES5
							}
						}
					}

					if (overlap) {
						SES = SES || D * 2;
						// Remember we had offset of each sequence?
						for (i = 0; i < 2; i += 1) {
							for (j = 0; j < 2; j += 1) {
								overlap[i][j] += [startA, startB][j] - i;
							}
						}
						return overlap.concat([
							SES,
							(Max - SES) / 2
						]);
					}
				}
			},

			lcsAtoms = [],
			lcs = function (startA, endA, startB, endB) {
				var N = endA - startA + 1,
					M = endB - startB + 1,
					middleSnake, x, y, u, v, D;

				if (N > 0 && M > 0) {
					middleSnake = findMidSnake(startA, endA, startB, endB);
					// A[x;u] == B[y,v] and is part of LCS
					x = middleSnake[0][0];
					y = middleSnake[0][1];
					u = middleSnake[1][0];
					v = middleSnake[1][1];
					D = middleSnake[2];

					if (D > 1) {
						lcs(startA, x - 1, startB, y - 1);
						if (x <= u) {
							[].push.apply(lcsAtoms, A.slice(x, u + 1));
						}
						lcs(u + 1, endA, v + 1, endB);
					} else if (M > N) {
						[].push.apply(lcsAtoms, A.slice(startA, endA + 1));
					} else {
						[].push.apply(lcsAtoms, B.slice(startB, endB + 1));
					}
				}
			};


		// We just compare atoms with default equals operator by default
		if (equals === undefined) {
			equals = function (a, b) {
				return a === b;
			};
		}

		lcs(0, A.length - 1, 0, B.length - 1);
		return lcsAtoms;
	},

	// Diff sequence
	// @param A - sequence of atoms - Array
	// @param B - sequence of atoms - Array
	// @param equals - optional comparator of atoms - returns true or false,
	//                 if not specified, triple equals operator is used
	// @returns Array - sequence of objects in a form of:
	//   - operation: one of "none", "add", "delete"
	//   - atom: the atom found in either A or B
	// Applying operations from diff sequence you should be able to transform A to B
	diff: function (A, B, equals) {
		var diff = [],
			i = 0,
			j = 0,
			N = A.length,
			M = B.length,
			K = 0,
			customIndexOf, lcs, k, atom, ni, nj;

		// We just compare atoms with default equals operator by default
		if (equals === undefined) {
			equals = function (a, b) {
				return a === b;
			};
		}

		// Accepts custom comparator
		customIndexOf = function (item, start, equals2) {
			var arr = this,
				i2;

			for (i2 = start; i2 < arr.length; i2 += 1) {
				if (equals2(item, arr[i2])) {
					return i2;
				}
			}
			return -1;
		};

		while (i < N && j < M && equals(A[i], B[j])) {
			i += 1;
			j += 1;
		}

		while (i < N && j < M && equals(A[N - 1], B[M - 1])) {
			N -= 1;
			M -= 1;
			K += 1;
		}

		[].push.apply(diff, A.slice(0, i).map(function (atom2) {
			return {
				operation: "none",
				atom: atom2
			};
		}));

		lcs = this.LCS(A.slice(i, N), B.slice(j, M), equals);

		for (k = 0; k < lcs.length; k += 1) {
			atom = lcs[k];
			ni = customIndexOf.call(A, atom, i, equals);
			nj = customIndexOf.call(B, atom, j, equals);

			// XXX ES5 map
			// Delete unmatched atoms from A
			[].push.apply(diff, A.slice(i, ni).map(function (atom2) {
				return {
					operation: "delete",
					atom: atom2
				};
			}));

			// Add unmatched atoms from B
			[].push.apply(diff, B.slice(j, nj).map(function (atom2) {
				return {
					operation: "add",
					atom: atom2
				};
			}));

			// Add the atom found in both sequences
			diff.push({
				operation: "none",
				atom: atom
			});

			i = ni + 1;
			j = nj + 1;
		}

		// Don't forget about the rest

		[].push.apply(diff, A.slice(i, N).map(function (atom2) {
			return {
				operation: "delete",
				atom: atom2
			};
		}));

		[].push.apply(diff, B.slice(j, M).map(function (atom2) {
			return {
				operation: "add",
				atom: atom2
			};
		}));

		[].push.apply(diff, A.slice(N, N + K).map(function (atom2) {
			return {
				operation: "none",
				atom: atom2
			};
		}));

		return diff;
	},

	testDiff: function (sText1, sText2) {
		var aText1 = sText1.split("\n"),
			aText2 = sText2.split("\n"),
			sDiff;

		sDiff = this.diff(aText1, aText2).map(function (o) {
			var sResult = "";

			if (o.operation === "add") {
				sResult = "+ " + o.atom;
			} else if (o.operation === "delete") {
				sResult = "- " + o.atom;
			} // else "none"
			return sResult;
		}).join("\n");

		sDiff = sDiff.replace(/\n\n+/g, "\n");
		return sDiff;
	}
};

if (typeof module !== "undefined" && module.exports) {
	module.exports = Diff;
}
