// One-off: augment snapshot.json with (a) route polylines for recent runs,
// (b) historical (2025) best efforts so PRs/history are all-time, (c) metadata
// for activities referenced by best efforts that aren't in the main list.
import { readFileSync, writeFileSync } from "node:fs";

const path = new URL("../src/data/snapshot.json", import.meta.url);
const data = JSON.parse(readFileSync(path, "utf8"));

const polylines = {
  "18902357824": "ofjeGrrboNy@qDm@eBW{AQq@y@uDIUY]M_@GIIAc@@OAk@WWCSHmAh@g@R_@J}@^]HK?MMS}@SeACa@@ILM|B_AxAs@JQL]T]@I@YCMIc@Mg@]qBCc@@}@CSKYYc@IUAOHSJGv@AbDCZMLMNQTe@DE^OLCj@Ab@Dp@f@^PH?LKJOd@}@f@WZGZDNDbAj@rATLHn@`Ah@f@TLF@^AFBtA`Dd@jB\\dBTf@Rt@^lBDd@@fADx@P~BHz@^pB\\hA`AjCpAlEl@`BhBxH\\fADd@zArGzB~HZnBJpAFFVLh@^jCnAjA`@vEhAlEz@dB^l@R`JfBj@Nf@VRD?KGGYM[Wg@WM@CF@X\\xA^z@hB~AlA~@fAdAb@\\VNx@ZXBJGJm@JWCMMQOYeA]o@YgDqBaB{@kA]wAYyGuAe@GcGkAiDs@gDgAsAg@g@MWMEEAKHiASQWOkAWmBO_A@eAFgAVgA^k@XwDvAeBt@y@h@m@TcA^{A\\eDpAg@TaC|@o@ZM?GEO]a@aCmB{J",
  "18881036082": "gnmeG~t`oNQ@SHQRGPERAZBRH\\VVXFlC\\VAJERQLYDS?_@CSKYKMKGUGcCYWCM@ULKLELGZ?d@F\\FJLLRJvC\\R@NEROJQFU@]Ca@GOOU[MsC]UAIBUNOZGZ@\\DXJVRNHDvC\\X?RITWH[@a@E[EQY[SEsC_@YBUJQXGXAb@DRJXNRLDxC^N@RETQLSFa@?OC[IWKOQK]GaCYSAUHQNM\\C^@ZHVHPPLPFjCZL@RATMLQHUB[A_@IWOWIEc@KcC[Q?UHSRITE`@@\\HVJRLHTHdCZT@JAPEPQJ[DYA]I]KSQMUEcC[UAI@UHSZIZAXD`@FNLRJFRFdCZ`@?TINQJYB[Ce@IWQUWIuC_@S?QFSPOd@A^BXHTPVLF~C`@H?TCPKNWFW@]Ik@KSUO{Ca@]?QHQRM`@A^Jh@JRLJ\\H|BV\\BVIPSHSD]?YG[KUSOWGkC[W?QFQRKRE^@`@HVLRRNzC^V?PERQHUF_@?WG]OYQKQGmC[[?QFQRITE^@XF\\NRPLxC`@^?RIPUHSB_@AYI]MSSMyC_@QAOBQHQVIVA`@@PHXLTPJNDfCZV@JAPIPSHYBYAa@M]OQUKyC_@YBQHKLM\\CX@`@JXLRLHVFhCZP?G?",
  "18849842575": "ypeeGjekoNN]^m@Rg@^}AJ}@H{@V{E?q@FgA^oD\\oBDq@?}@J}@?qARsCToBJsAFeDVkEH{B@aBD[?u@Do@DqDBs@A{@BcBCaABsB?sFCsABcBGe@CaANgBMeBc@yE[yA]aCYaA_@aBWw@Mi@mAgDmA{DYu@]m@Y_As@iBi@cB_@y@qAuEo@gBW}A_@qA[s@Km@As@Qu@KSe@Wi@i@U[gBkB_@[}BeCoAmAF@dBfBXRl@p@tAlAj@r@fAhAZ^f@ZHJPv@@x@D\\r@lBb@rBl@pB`ApDLb@vAjDbAxCt@nBl@pAv@hCf@pAjAdE`@lBZnBXfAj@|FJ`BGjBDzBCdBFxHIlE@rEGjC@vAElAm@`KEpCw@vJ",
  "18824801408": "mfkeG~q{nNpEeBPBPVfB`JLpAx@xEDr@MlAAh@h@pEfA`G^fAd@tBn@~DGVMDyCTyB\\_A\\aCpAgBjAm@JQHQ`@[pCK`@y@B}@^WT{CrEgBjDc@fBEzA@b@FN`DFfEPNDFL@|AKnGGb@mCzAkIdD_CfAoBp@iJxDy@ROEGQ_AgF[gAk@gCS@iAr@i@HmBGqGu@c@?MLB`BPrA?d@_@lFUxAsAzFW|A@p@CXg@nCYf@{@v@gBb@s@@m@Rc@AgB]o@Um@AaAc@_Ao@cASYOqAeBu@wAuAuAi@aDIQiA^m@NeAAg@MsCsA][MW}@wEAWBMdAq@vAe@zCqAJO@QuAqHuDyQq@{DgFoWmBkJsAaHIw@?KLU`Bw@vNcGr@QJDJXdC`NJNXDjc@yQLQD]YwBcDqQk@yB{@mEIQS?k@RiFrB_KpE_DhAmCnAmG`CcHvCgAXOIIQ]wAa@eCi@eC}DoTO_@OCcCfAeCfBoClAwZvLyAl@_Al@}IhCsKhEcBv@oAv@oAf@YVMd@BZf@`BRhBl@pB?ZOv@BZxDvQlBnKlChMNHJCdB{@VWP_@Vy@V}Ap@uBh@{@d@c@^Sr@Qz@Et@Jv@h@F?DCx@_CRUHAdAn@bAGbAZv@Kl@i@TGf@HXXJj@HpFLr@Vv@Hh@?h@SrA@h@FZlAjCHz@I~BBnA[~DQl@g@n@GT?NN^pC`DJR@PEXILSFk@Ds@Z}@tB{AzBc@fACt@J|A^`At@pAPp@LbALXf@N`AOlACf@a@p@K`@Fl@Zr@?RGj@k@b@GnDoAl@o@v@Q\\C~BLrAKb@@j@Sx@P`@VdA\\n@?X\\Rn@NJRDFAJOBoBKCIXeApOMfEn@pCN\\PDp@Or@@fAr@n@XJN?Ru@lHHn@Nj@\\z@VxAAXGNYLiP_CWOG_@LaAFcCN{BEc@WcA@[jAkBdCuBd@{@Jc@Fs@?_AbA_OFgBKkB?k@BMXWtJaETS?UU}@q@qE}AwHC[BWtQ}H`Be@`Ai@|CiArFcCbI_DtCwAzEeBRDFNPpAfA`G\\fA`@hCn@jCXr@~@FhALtBFn@Lr@CfB}@rBEjBa@p@WVYVg@Rk@?UWu@a@u@wAoHOcA@MJQRK|P_HVOBMa@uBKw@kDmRAWJ}@BcAaBmI?k@FMPMn@O|CwAlJyD",
  "18795021595": "cjkeGhkeoNx@fE|@bERtA^dBv@~CdAdFf@pCdBdJDv@ANKZAFNf@PNHNNdA?n@Gz@E\\_D~IMn@E^Av@Dx@PjA?VMTOLg@N[F_@A]Ga@Q[We@q@_@aA[cAc@s@iDoDeBaAc@a@GMBKpAsCj@}@h@m@l@g@b@Wn@Wj@Ob@Gb@CtBBx@Ad@GV@xATl@EJ@JJJRN|@@j@Ez@Mv@IPCBi@c@_@Sm@U_@GyDBgAA}@Jm@Vw@p@i@z@_AnBIJEBaAk@g@c@IKBOfAcCh@_Ap@w@h@e@\\Ud@U`AUhAMnB@bAC`@E\\@r@Jb@@b@AFA@ICs@Ba@Io@U{@i@uCU_AmAgH{A_Hk@uCe@aBg@uC{@mDCW",
  "18756901229": "ifjeGrsboN_AsEq@gBa@mBAOBo@MsA[{A@WxFsBlDyAxCgAlD{Av@YNCJ?JNd@bBNv@PxEJ|AJ`ATlA\\nAhAzCtArEh@vAxAdGXpARl@Jt@`BzGN`@`@\\LRn@vBd@xAl@|CJlALH`CjA~@`@p@RtHdBr@Hr@R\\BnCp@lARhCj@rAT|Ad@@J_@fB\\^rC`Cx@x@fAx@ZPv@P\\?VCnA[PKX[PG|@TfA^r@Fb@A`AR`@Db@LJFb@b@tA~AzArBhCjClArA~BxB\\b@\\ZXb@^PRTRp@@f@Dl@h@zAd@nBb@tAJf@Z|@TfA\\nAt@fBjBhFf@jArBpG^~@ZhAb@pAf@nBThAVfBRt@PfBPnABp@NdCMhBAMHM@OHY?YMmAg@eGIm@Y_AEq@SoAa@mAG_@Uw@mDqKeAiCYcA}AgEc@eA}@iDs@_C_@cB{@}BOw@Au@G]BCAXDUe@g@k@c@q@{@sAqA{@s@[c@]Yk@u@cBaBoCcDW]Wc@Y[g@]wBU_BIi@[e@Ow@OG?MD]d@QL{ARc@?]Gg@S[Q{BuBiByAGG?IBBi@c@OaCwAa@iBa@_FaA[CmCk@]IYOaDk@}A]{Bq@mDeB]Y]Q]GYK_@Au@MsACw@B}@N",
};
for (const [id, line] of Object.entries(polylines)) {
  const act = data.activities.find((a) => a.id === id);
  if (act) act.map_polyline = line;
}

// Historical (2025) best efforts → make PRs + history all-time.
const D = { "400m": 400, "1/2 mile": 805, "1K": 1000, "1 mile": 1609, "2 mile": 3219, "5K": 5000, "10K": 10000, "15K": 15000, "10 mile": 16093, "20K": 20000, "Half-Marathon": 21097 };
const mk = (pairs) => Object.entries(pairs).map(([name, t]) => ({ name, distance: D[name], elapsed_time: t }));

Object.assign(data.best_efforts_by_activity, {
  "16118515713": mk({ "400m": 115, "1/2 mile": 237, "1K": 300, "1 mile": 485, "2 mile": 974, "5K": 1524, "10K": 3088, "15K": 4688, "10 mile": 5033, "20K": 6329, "Half-Marathon": 6700 }),
  "16252976207": mk({ "400m": 104, "1/2 mile": 233, "1K": 290, "1 mile": 508, "2 mile": 1092, "5K": 1695, "10K": 3614, "15K": 5464, "10 mile": 5871, "20K": 7447, "Half-Marathon": 7886 }),
  "15879822523": mk({ "400m": 131, "1/2 mile": 269, "1K": 336, "1 mile": 546, "2 mile": 1101, "5K": 1921 }),
  "15637458659": mk({ "400m": 131, "1/2 mile": 278, "1K": 356, "1 mile": 574, "2 mile": 1459, "5K": 2126 }),
  "15558680138": mk({ "400m": 141, "1/2 mile": 288, "1K": 365, "1 mile": 596, "2 mile": 1230, "5K": 2064 }),
});

// Metadata for best-effort activities not in the main (recent-window) list.
data.best_effort_activity_meta = {
  "16118515713": { name: "Long Run", start_date_local: "2025-10-12T09:04:15" },
  "16252976207": { name: "Long Run", start_date_local: "2025-10-25T09:06:54" },
  "15879822523": { name: "Morning Run", start_date_local: "2025-09-20T09:11:32" },
  "15637458659": { name: "Morning Run", start_date_local: "2025-08-30T09:06:41" },
  "15558680138": { name: "101st Run of the Year", start_date_local: "2025-08-23T09:10:12" },
};

writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
console.log("snapshot patched: polylines", Object.keys(polylines).length, "| historical BE activities 5");
