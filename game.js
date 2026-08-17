const W = 800;
const H = 600;
var MIDI_SONG = "eNrtXY1z2zay_1s4lMTYMpx02nt57d3FubqtE9vR2bKUjJOxVGl0pC2dWFVK6ktfzb_9EcDie8EP2XHcnGaSMQUCC2B3f7uLT776yx_RX__4qnGahXtZY5CF32bNrHmTbWffZM1p9miQRXvZ1pssvMyW2SD7oxdkW__7j4NWkIXNbCtI331DgoPGEH6d7em_8nfNg_A5_zV_97X2btF7Zr1Tv2b5r22ooRlM819RlB1E-dtW_nb5uveYbKetVdYI_kF20_BKf_hRPLwgux32cESaZ1mn2csffyKtlzmhq_tp-hZret7SIO_FKQnTPFP1h7w2I6VB6282sjA4OSDbVFJuwnZeU5MmHB6TRi6uZXaw4inHnQopJ4dWSv9HO8-bfZHSWWWtYLGzdZN1giwK5tv5Uxpk7eCovXUA7ejvdXnLaOOAJ1fvnraDPGMjOCGR7EJnQZpUAWkuKuR593m33eR9PyYtUTjRC9O37aDTDlPK4BPyiCcctVsGlUAms3zHeT5K4CVp0xetYLnTSGkPUvZXlldtxaqhXefF5jsNrLpOmybnfdsKBs9EmXSnzcrMdtqiipns0Uu7R33yiOkVpZHuc27I5tHEJU2kRV-RhvNyppXYgp7LjsV5raJoxNs23QlZ2-IdXvuASFJTINXKO8szTSHTsco0l5kW0Ms5-2vUO5G9fcU122Qs1hfK2GmBHH_icjTkFhfIbab6KcjPJHkqohBEFDJtQOW4hB6mSo5KMzt2z_rQ0g7ZkfKcYfJEhbzKEzvA1w3YNmDbgO0Tg81k_giaBkCj8DkegLuVIZBozZGQ7wJKT3ZCjBxjqGDIUqKP6gXX8wHXcx5fOCjUQH88OJCg5yQSIPGWk5Cqy9DdJaFI_CD0WWIz3olYyXP211CluZKxZMRW8PZAhCegv7I7gUw23psYlLITmKHZ-YuGUczswynShxeiD0Kjxi6wrteR7Ux0vJ5MF8UynWrIrCLTGEicK5kuMJmuBD9-EvyYgUyHrkyvqss0j43PimR66VoaW6avEJmmmExj0YejghIbfP5p8Nnh-Mxjj7URGgTzdkWk8soQKVMqi3ZYRL4AwRFIPWLZp-1IR_I2imSjjSLy6vd4ggRp_oL6LkYvyun9fPr629d5Sj5mbAXvd54MeMD3KzwFwWX7ySDTQice-r36Po_oZEwX5V0ZdvvfvW4__i3r8KpoqSf5ADZ4lXMJaqWKGAZd6EA37wB7QZ2-4VOPmdzNnCJYVDnFQ4dm_am9Q0TVO1z123nVMgo473XP2sSggpGDpvBXrHGvWJt4N-wIRgaD998vo1wQxKQha9AJBcGEyMAXKSPJIV10yuJdZTnHFleCYEgiCLHuU6YPkxPt23Nid1DEifHZaa9Uu2lLfBwYmRzQej729fwImn8keh47PZ-QHbTnVlFPz4VleXv6uteWDPiBPN4zYSCk43ZdaIML8CC40MrkaBUJkqqRNaw39v1BsOSChPJB2Gj_YJj6am74R19xwz_5yvG8iR1c-AfJKlJCx1YnyNgKHxOzgU2lMfCKwLiZ_Q2ChDQqNLwvil8R7if5X8E2awQ6h0xzyDSS4mkZwSqXBMQyCyi0gEITt5Aai60g8woyJ0oBWHshajIYlo8bodQSSsVEBhxFZKV0bWXw0StSBn_bnaHyEkS1BFHFxJghKZthORGcFSJfKZFXmGnpcWNBBdMAwTRAMMUzLnmQs4SYxteNOhq3IhG0PoLWR7bGFWoWqkG6pjQQTZlDm6_yt9RelZmFFPLPlM2qbg4oiyMATLSGhCtKUmK9ouRqSkqSL5KMGBY1TOMvXZeQyoni38KuWXkTOVg5Ufhc0YFpU_jMyKb2i6TWtfvRQ2a-VnKYq7jfY7XT5rjcT70zXwb3dbKIlTY4P_e3GON8gnF-ti9ZWIPzjrs0zH-HY3kvE6Lo8JbsZZ3n8EampJhXEFI8wY2r6Q-MhpUa1VIrVgoxIeRCiNl9QpEte-FWhzUbcdnXkOlaOTWEAx-ggx-0gMpQkqHrqn2u2YLpWGWyg-0t_xSzjB0HRBZz3GmiwXXiGs-JX_klriamRCNG9c3TM5_VBL_gRBiGaNVbrL6KKw4yb8naiRTRuKoF_cEz7GnluOOuZCxdyZZczTCm5_lYRY2JvH5upoEyBiUbgy8fkghb27BmMi0WRvqQxWRPn05Q5i8vEbl1RTwzJW1oRNumEhdHxzO_vOR6feJvPwalWRGU5iIW6SJQ0mcwYTmPPN3jszsz-qRZSTGoqwk1p9h6kBOSqAw5NZx0IVcItYZZT-yDWohBLSoIVkQX-tYIzLSGYyVXF2ojMVQcyebuiLip_7059ThEISbi4ScQDz_xjTjHXERDMzf7fQ0IvJYIdFb5BqUIVEF56rrDMRLzOBj8DS9Pq78oWP3TqsWqQ93fB7BoqRLwu0KMylW-iRTshQu7ZF9KqCFRbdrSK6h5BEOPkd_tXdixkobFkev2RppNvQKejECiIxeTFxXGEDgZQ7KjKqPFhE0JRTk3dhidMUwRaRJ-67eylLND6bpsGwusH-8rf9KGRrdFo0Ul53IevVNkh_nDwJXvUFud70Dur_cyO9tYHxEWTR4ZXtO7cWKGb5wod4qIMyxCYG2vt03n0Hj1LXsC9fNO_jeZEeh9SXP_slv9O-0WEonHhutEZrtjAZHYF8RX7b9eWejEyD5-qPnpQnGLqe8vQuzpQxC7PdUf35u4Q6-4A_AqD4svYRW-GLO7t-FPgvCnL_kT3yl_EMyX8Gfi8OeiKn8ubP5c2Py5sPhzJPlzpPhzofgjEgpYIiOks77uMW3_y1-zVaSJtorEGxE4i2INg0kn0NMTbkPQtUaTN3oJCAF3XeN2CC9WGkt-kCz5gbFkBXkOTY7suhw5hBcrkzGjXq5bnRV72XqZMUJ-DToy5wkRg2oxozoTigyq3WvboLJO3MKg1uuWRIqdtUTIb70L22-V7a3U30QZhImNKk-Cjw9Qf2gunx_Z88FvTUtRwJhRfcaMvIw5V-vPD1AR7k2_qXn6MrqlNAnrHqq9Pt0Ye_dCTEjoxBo2HzqgeURui2_pY1JkgUOwxV2MMJjknWTCHdOlPTbT1hQ0FsnZMFMDPLNfngGj3Rg5IleTyVBl5YVStcSRGEsUvoWQhMCGuplVDGWsWmhN3Oi0nNEtWG81ipcz3q21UBB2LXclGKuRr2ztsJYl7kkcEWSLqoijUaz32-5yhwNbLSY2zjPI6bmO8CJJQfztTr8EdlcNoi9VUK8WMLBVArXbSja1YVON92XcvcMDRG2pl5-d6LDkMWm2M16qSScnH-1x6_mStJZZ2txhWdhhRWrjdoEmS6BTZbswVbYL2yh2ee8hGPwn2RWk430S_pyZxQee4q-g-KkqPlLFX5TVjhTHap9YM6n57w7jInnM149fqF0dk32iNp-xXa9jUN4hrBzLtS0iJvVBFmEwfk6a0yyKxH5aUP8xIJhPMjwKJu1Izv221N4a9iIntcXE-kJBa_buKQnkSg4TJl-bMHLy1RzCrWqfo4OS3FFboklT6q5WWrc-ZNtUuCteD3t7cNRuyKVZ1gq-IE8rMXOptQ1oTk_R0zwAvHyjtDuyySU5OX1lhahJWeBcJLLGKmtIJyWpKPJ_jdNMn_rk3G8F5sOOmOx_AqvYT5ior2DZYwXpK0hPIB3bguXdZQU1hFBDCDVIDpaUxLd7aSWRnVJUSnTRJoKSXP1nFic2-vc59E-XYKSsu-BuKhQTTDoY5piNsbnUV_x3Byx28yyTCtHsKWtuarziOz_BLX8oceUPIjU0d3eIbZtXwg0R7PiDkINyQ6Nub58EuuwwmsANGeY8qkJLSNXcrjdT2_U0orLB9kkYTdrcE9CKhrQiJW52_r1Lwg6gsQ2L5VP6hGzAFDqhXEss2k09tWw3b15k8lOdlRGZjIMpgy4JzLBELvclBkmj1ETU_8KcVGT1mlQmGlk6tBloyAXyO6m4RoBmGNldi-2GTVRdBUdmRL-shQNbLeQpMNK0N-KH2lEYnVoFNQDmNHQjpWoKzI51SagfbTNOFugGLQBgFYlY21LoVqnxcIwKV-FZRb8kMO2o1nPrGNyOfnTKIMU3mJCmPiA2JK9Z_QCjsrEejvUQvpxXNIWKtHn3SpajUJ1QS6EpkXQu5RYCsQwDn2UYVbUME9syxIX6oFkGmP6uZRDGqEGYSB5UMghycKYbgvEnMARD09bbVY5s1o2lhtYzCOsbgo0B-DQGILpPA3AXIUKibYPXDME6oUFSywDUjAi0zexTHYU1IgFtz63ulh3gj0m0HvDLPP8G4BuAVwb4ep59HSAnrievE-Mna8b48d3F-A8O2RLN29XRjKJWTCU71r-CsZ33vjPR6BWRm9tcIkuqxVlSOXJSBqJUMNUlIbavEQ8uS6Ks2B1uTTFWTfBIGfapVwGUukSpwLjKWSoNWA0bwAugUHsAndQDV3J34ErwAXTii5sT9wDrlW4tGmWS9cbNY2D6_YLOjJHKZIfAKMZhVIA-BKs1QYdZZok-dGzjoLB0siOqgL7PgrrQh7q6g9Tk3mPUpKInu8XgNK44SzVEB6WfDGTD24FsZG7nqO3ibo-2f4mV7K4Nu2JfF1fxdQ8WbaMitE0ePNrubW64ZEpo7Mbg7Qc_JVRvhOhxc1eoU6xUdN1hHxqjGrj1j_Lqu8ryADW-TYCKhpk1QRwXgfjLmdZp_zdO69wRSMM1QKpP2nwpaF0bpeck9KFULMco_q7vcuM10Fph9cVFaWV0hkX-rpaL9brWagGtybcqy63jWy63fhaU3gadnxGVa_rOkSn8O_CZ9-0r1_KR9zgxupZPvA9fuEHXJ0fX-L7RldwdupKq6MJmShO2RbQUZR2o6CY7GN7hFGlYf_Zm21kfCC1QhQ4TbdHObK1BRHqqs-t_NIXpwMUPbXE9gl9ItK9NfVt_BL6Z-WhDOdjLibYVVpOoUA791h1i35lNvHdml1aqXyFp3KEtt5yqO7SN24SKxxrlUJy7UPTI6aTKjE6KQW-p-uDeui0sbAtYFEH0WijVWEpVfo9ioq4TcY23JsUUq881OBjdQrOqH8YggVnDGxyc9jZ_ZPbOJ0O7XYZMkUU8-54tQ8ZKlzs-P3lSIDnXN2o3SG3wusHrBq9_MryaZ_JG5fJNZYvU9ymg9EQwwCTnfJ9CSHkKfBoYN4rWwG4L4oeInmK3D5JY36dwsQrfpyDY9ymqYnRZGaNe-eHfpyDY9ymI_f0Y4POYIF-nIM3aspU7BOrJdFEs06mN3BKZioscz0nDDtat78cQ-_sxINPhpxp3Vh9rNqrZ31j04UhcwVcg09Qj08C2gHeDW_1EfBl-7fvab4FjOIUWugfDpq4PLsO1Pr528S3e1sE5reEJSOgJ7N57IoU_9Lzn6bpknSkf1Fy0QAa2TLxmRL8HNdSuZq9vXjZm5f7NStNrVrDBdMMi5gyi7Q9TbYLzTXC-Cc4fYHAeUvbSj1p_m21G1BvQbkD7JwYtGsJvhtmbYfYmHt4MszfD7M0w-56H2YG6jN5VvUFlM8Oyv70Tc6OTKtlDYhsbteENX-Q-txFazfjwGPs9vYS_w29J4k_qYv76BxWQ0bn7pWjxYRshS31viP4BBHYbD75f4J_WNg5xXSZTbqgAuACfmndM7UgwELfEk-LXiXp9arFaxnZOR-XYYqpKH2ufupnLUmjwCV9f07XGPv-XavUiWiAQ03RS52hqWsyEhSqkTcP8ipJaFnPkgyqknTK5pqkyz8dy9vyuyGifnLzRicsWfSzn1W_F_V8Vv14W68iimCMrXEeWgiXe8zQLg2lpscIsqynMtttL5IEeiZ5pGsES5poysIQU2u-ac_pN7DNC77Dt5--WpNHO0vy_sAk0idFiDygPzFwLrOdWG6SVoInbrpXoojG42zM7JJv3fbJnb3sYE4TMzs_ONNHzvkw8qs_fpkUy7vd7PhmnlNGXeT8uff0KIIMtQjNhaUvdyEEreZ93-NKx-2HwUQjrvYZ_8UZemPv-vLD7NxroWdnfLbzTL2J97Le7fS8j8kxh4BX1jffNR5-Yc48bhrtajVrHaaNVbVLGN4Wd_OjV5huybfTKELzfPtHXzTI8D7H-sTdjRIXZi1iIdOz0MC7C7UyUm_q1uRn0cpY-ysOTPtPUgCsVIk1FxelTjL7pg-pfamo8tRU9LjBeFLa58VJhTAlw3-cpSd6US0ymsWWhRCX9sx6JouygD-H2ORDQu9LhEHibdYZMb95m6VDrw7XlniUdJ3YrJ4QyI6IW4XwrV6_GKb3tMW8v_ydZgxJWBDHXJlsprx3EG3fsNE4xkDeM9NyGOerwMHiINfUWPORE2_0znGh9plLQMEOGquCNoPO71usOp1P65kP5G8HdpbeMfLPIHw6GiLFKhdGZ2f4nVWFEgdH6VQtJTB-00HwQGnRwL5Ebnef9vMy3mDbSYiuvsxUJCzvB8eD_tv3zzAnRuf3KLatr1IXG4eMxMOw-5zS3nBPqhkq8lDf8NJwuGk-ZcxLWMoHMMdsvsTwrPTc6ZaivReizIQXRtdk2ZJ--GTPu-9gEDSyIN7V2VOXPQu_x_Pb8ma_Hn7Sw17P9AidvqXxS1ZezuZKnIjhCLAMUZOBNnnE3l-OX_yuI4GKLLezrr89UFObz_eUgF9TiZ92unS8xT_MwUPXcbLfj1_y7_pkK34r49Zx7n2r8Cpyx_BtRj6ZHuWk9oDTz4Msf3edirB8LI6-xoXzSLxzP9XURa182lqW88xlaSfS6p17PVhXHqOdZaFCKg-RfXvjMvHH_wj9r0WTikdXdZvAqQvgCgc4rTks43ejwgc1B1jlkoxR4mOQPB4eufjND09O9RQ-xlzSxw_pzLQj-Lh5ugLLPenqo695FNxKl7VfxhVlWt5yliRB0YX1JD2sROzXasl3isY21cYUYdbCuGDJJ0YQXv4aeB7_C9hhW9twxqk2-2k6HnGspG2oy2frcO94VPuXT62I61dX0InlX4oN9BHU16iJOWBK2FYcSdGzd-VkXEfYUS8zLu4kJRnSg_JGmLChRrbUITHUWDFGeLnSezsp4OtUJaq3UeJq8QyaXr4rnVaknZMsxXBX5dxHW1C85V_9N0XRyXhs2nUxLFU8nz999rQ265SRz7xnSa5q3iU5FzfI3RdZauKtpng8dj_sm2ZrB8nXvMWn8p2jcsgJfmAsl_DnPeOXrrpGH_R7w3-kK-g-kRpB8qL5V5EzV0CWk5j7SF04k97H7--QvWXSc2RY1H7A9zd_k5vyI_5ybP1P-M30BhVo8-RfIdch_LsxCv0KhH6HQI568hFzH_OfKpPEeCn0PyGzz5A8m6d9MGtf0Z-uvWfoMqtrl6f8xS300f_5uEvk_syE3ZubM-BkGRtkwNMqGDTNz0_zZekraX2Xto-zgggE6jJ6KpeBrWDmelS9EX9m7EtSXbeRduyY5YwF6ri1Ai3t-r9TCc1Jzz4NWk7sP0GyZvm1N7nRYQhNqXyFCqzaLFm9FVFUh5-PLtybSPS3mvpw72qoovi0UV9uqaG0pdHa_mOQMyU81yYsPFk2U5Cc1txyIa5ZjdS2zfh2BtdUA35BIqTyGDyQ9RrcWrPI8v0Ie-vcQ3Z94yLr0GL7B9JiV-gV-879ckCsr36Fv9yJlwaFV9Yo1dxeau4tdzV7pmGDT2YSsvlK3sQcbe7CxB1-WPcgTtvS9gLZdYLfezF6X2wgnY1JyMTUrMO8qmZr7J2XUqnKG5hZJ-T2yuRaRV98WaTRBDK2XplLoleumQN6Tg1ePmQGROz2zEIZscjaqdXjc1ccTajdjhB0cEyUazqWg6Mf37KvitB2LDfS2GH3HYoUdisYXRBL3VltkJyJyn44Ge-fTAhj8jU92LbQbguP1rtMZF12nU_2TXeglyK5RK4VsWgbZuCpk0w1kv0jIejcZ17gBS0AX7pmLcMRaezurOmjjVsdKCI0LERrX3guMfH5s7O4ev3TtD_YBvTKkqmvQNoj90hBb6xiAW2JdZzpUXz1Hneh43e37xhcEFv6YWel0jYtWqzrLySeD4gaCGwh63Oy15WbrQjKuHN_eApp3GdfGRXHt-E6hOi6AarXjfN3Ncb7Ncb6Hcpyv8SlPC2tGZXNq-LPdolP5bP_GuGyMyxdgXEDuuCpO650dTkyjs13D6Ghz_4KU57Sw4o_z7fRi-2KtvFyz7fRRTu_vN_wgMHvSeR7RM3qve-135G9vMmFxOlD6b4PM84kHdrSXGZQOe_iJPN3Lfnz6PPt__HibSQ";
const A = "!#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{}~";
const B = A.length;
const Z = B - 1;
const PROGRAM = [65, 59, 33, 0, 56, 56, 115, 12, 36, 0, 37];

new Phaser.Game({
  type: Phaser.AUTO, width: W, height: H, parent: 'game-root',
  backgroundColor: '#090d18', scene: { create },
});

function create() {
  const s = this;
  s.add.text(W / 2, 180, 'BARRANQUILLA', { fontFamily: 'monospace', fontSize: '42px', color: '#ffd166', fontStyle: 'bold' }).setOrigin(.5);
  s.add.text(W / 2, 235, 'POLYPHONIC GM SYNTH', { fontFamily: 'monospace', fontSize: '18px', color: '#7bdff2' }).setOrigin(.5);
  const b = s.add.text(W / 2, 340, '[ PLAY ]', { fontFamily: 'monospace', fontSize: '32px', color: '#fff', backgroundColor: '#ef476f', padding: { left: 24, right: 24, top: 14, bottom: 14 } }).setOrigin(.5).setInteractive({ useHandCursor: true });
  let playing = false, song;
  b.on('pointerdown', async () => {
    if (playing) return;
    playing = true;
    b.setText('[ LOADING ]');
    try {
      song ||= await unpack(MIDI_SONG);
      b.setText('[ PLAYING ]');
      playMidi(s.sound.context, song, length => s.time.delayedCall(Math.max(200, (length + .3) * 1000), () => {
        playing = false;
        b.setText('[ PLAY AGAIN ]');
      }));
    } catch (error) {
      console.error(error);
      playing = false;
      b.setText('[ LOAD ERROR ]');
    }
  });
  s.add.text(W / 2, 470, 'click to start audio', { fontFamily: 'monospace', fontSize: '15px', color: '#8d99ae' }).setOrigin(.5);
}

async function unpack(data) {
  const binary = atob(data.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'));
  return new Response(stream).text();
}

function variable(data, state) {
  let value = 0, digit;
  do {
    digit = A.indexOf(data[state.pos++]);
    if (digit < 0) throw Error('invalid MIDI varint');
    if (digit !== Z) value = value * Z + digit;
  } while (digit !== Z);
  return value;
}

function fixed(data, state, width) {
  let value = 0;
  for (let i = 0; i < width; i++) {
    const digit = A.indexOf(data[state.pos++]);
    if (digit < 0) throw Error('invalid MIDI field');
    value = value * B + digit;
  }
  return value;
}

function decode(data) {
  const parts = data.split('|');
  if (parts.length !== 4 || parts[0] !== 'M5') throw Error('invalid MIDI header');
  const division = fixed(parts[1], { pos: 0 }, 2), dictionary = [];
  const dictionaryState = { pos: 0 }, count = A.indexOf(parts[2][dictionaryState.pos++]);
  for (let i = 0; i < count; i++) dictionary.push(variable(parts[2], dictionaryState));
  const body = parts[3], state = { pos: 0 }, events = [];
  let tick = 0;
  while (state.pos < body.length) {
    const kind = body[state.pos++];
    tick += variable(body, state);
    if (kind === 'T') events.push({ kind, tick, tempo: fixed(body, state, 3) * 10 });
    else if (kind === 'N' || kind === 'n') {
      const channel = A.indexOf(body[state.pos++]), pitch = fixed(body, state, 2), level = A.indexOf(body[state.pos++]);
      events.push({ kind: 'N', tick, channel, pitch, level, duration: kind === 'n' ? dictionary[A.indexOf(body[state.pos++])] : variable(body, state) });
    } else if (kind === 'G') {
      const channel = A.indexOf(body[state.pos++]), count = variable(body, state), flags = A.indexOf(body[state.pos++]);
      const pitches = [];
      for (let i = 0; i < count; i++) {
        if (!i) pitches.push(fixed(body, state, 2));
        else {
          const delta = A.indexOf(body[state.pos++]);
          pitches.push(delta === Z ? fixed(body, state, 2) - 128 : pitches[i - 1] + delta - 45);
        }
      }
      const levels = flags & 1 ? Array(count).fill(A.indexOf(body[state.pos++])) : pitches.map(() => A.indexOf(body[state.pos++]));
      const durations = flags & 2 ? Array(count).fill(flags & 4 ? dictionary[A.indexOf(body[state.pos++])] : variable(body, state)) : pitches.map(() => variable(body, state));
      for (let i = 0; i < count; i++) events.push({ kind: 'N', tick, channel, pitch: pitches[i], level: levels[i], duration: durations[i] });
    } else if (kind === 'E') return { division, events, endTick: tick };
    else throw Error('invalid MIDI event');
  }
  throw Error('missing MIDI end');
}

function secondsAt(tick, tempos, division) {
  let tempo = 500000, from = 0, seconds = 0;
  for (const t of tempos) {
    if (t.tick > tick) break;
    seconds += (t.tick - from) * tempo / division / 1e6;
    from = t.tick;
    tempo = t.tempo;
  }
  return seconds + (tick - from) * tempo / division / 1e6;
}

function noise(ctx) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function oscillator(ctx, type, frequency, output, time, stop, detune = 0) {
  const source = ctx.createOscillator();
  source.type = type;
  source.frequency.setValueAtTime(frequency, time);
  source.detune.setValueAtTime(detune, time);
  source.connect(output);
  source.start(time);
  source.stop(stop);
  return source;
}

function profile(program) {
  if (program === 12 || program === 115) return { type: 'mallet', cut: 5500, attack: .003, release: .16 };
  if (program >= 32 && program < 40) return { type: 'bass', cut: 900, attack: .008, release: .1 };
  if (program >= 56 && program < 72) return { type: 'brass', cut: 2100, attack: .035, release: .11 };
  if (program >= 16 && program < 32) return { type: 'pluck', cut: 2600, attack: .006, release: .13 };
  if (program >= 8 && program < 16) return { type: 'mallet', cut: 5000, attack: .003, release: .14 };
  if (program >= 24 && program < 32) return { type: 'pluck', cut: 1800, attack: .008, release: .15 };
  if (program >= 40 && program < 56) return { type: 'string', cut: 1800, attack: .045, release: .18 };
  if (program >= 80 && program < 96) return { type: 'pad', cut: 1400, attack: .08, release: .3 };
  return { type: 'piano', cut: 3200, attack: .004, release: .2 };
}

function drum(ctx, buffer, note, filter, time, length) {
  const finish = time + Math.min(.2, Math.max(.04, length));
  if (note < 42) {
    const source = oscillator(ctx, 'sine', 140, filter, time, finish);
    source.frequency.exponentialRampToValueAtTime(46, time + .11);
    return;
  }
  const source = ctx.createBufferSource(), drumFilter = ctx.createBiquadFilter();
  source.buffer = buffer;
  drumFilter.type = note < 46 ? 'bandpass' : 'highpass';
  drumFilter.frequency.value = note < 46 ? 1800 : 6500;
  drumFilter.Q.value = 1.2;
  source.connect(drumFilter);
  drumFilter.connect(filter);
  source.start(time);
  source.stop(finish);
}

function playNote(ctx, buffer, master, channel, note, time, length) {
  const style = profile(channel.program), finish = time + length + style.release + .03;
  const level = Math.min(.14, note.level / 15 * channel.volume / 127 * channel.expression / 127 * .16);
  const amp = ctx.createGain(), filter = ctx.createBiquadFilter(), panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  amp.gain.setValueAtTime(.0001, time);
  amp.gain.linearRampToValueAtTime(Math.max(.0001, level), time + style.attack);
  amp.gain.setValueAtTime(Math.max(.0001, level * .7), time + Math.max(style.attack, length * .65));
  amp.gain.exponentialRampToValueAtTime(.0001, time + length + style.release);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(style.cut, time);
  filter.Q.value = style.type === 'brass' ? 2 : .7;
  filter.connect(amp);
  if (panner) {
    panner.pan.setValueAtTime((channel.pan - 64) / 64, time);
    amp.connect(panner);
    panner.connect(master);
  } else amp.connect(master);
  if (note.channel === 9) return drum(ctx, buffer, note.pitch, filter, time, length);
  const frequency = 440 * Math.pow(2, (note.pitch - 69 + (channel.bend - 8192) / 4096) / 12);
  if (style.type === 'bass') {
    oscillator(ctx, 'sawtooth', frequency, filter, time, finish);
    oscillator(ctx, 'triangle', frequency / 2, filter, time, finish, -5);
  } else if (style.type === 'brass') {
    oscillator(ctx, 'sawtooth', frequency, filter, time, finish, -6);
    oscillator(ctx, 'square', frequency, filter, time, finish, 6);
  } else if (style.type === 'mallet') {
    oscillator(ctx, 'sine', frequency, filter, time, finish);
    oscillator(ctx, 'triangle', frequency * 2, filter, time, finish);
  } else if (style.type === 'pluck' || style.type === 'piano') {
    oscillator(ctx, 'triangle', frequency, filter, time, finish, -3);
    oscillator(ctx, 'sine', frequency * 2, filter, time, finish, 3);
  } else if (style.type === 'string' || style.type === 'pad') {
    oscillator(ctx, 'sawtooth', frequency, filter, time, finish, -8);
    oscillator(ctx, 'sawtooth', frequency, filter, time, finish, 8);
  } else oscillator(ctx, 'triangle', frequency, filter, time, finish);
}

function playMidi(ctx, data, onEnd = () => {}) {
  let song;
  try { song = decode(data); } catch (error) { console.error(error); onEnd(0); return; }
  if (!ctx) { onEnd(0); return; }
  const start = () => {
    const tempos = song.events.filter(event => event.kind === 'T');
    const notes = song.events.filter(event => event.kind === 'N').map(event => ({
      event,
      at: secondsAt(event.tick, tempos, song.division),
      length: Math.max(.025, secondsAt(event.tick + event.duration, tempos, song.division) - secondsAt(event.tick, tempos, song.division)),
    }));
    const master = ctx.createGain(), delay = ctx.createDelay(.4), feedback = ctx.createGain(), wet = ctx.createGain();
    master.gain.value = .8;
    delay.delayTime.value = .16;
    feedback.gain.value = .18;
    wet.gain.value = .1;
    master.connect(ctx.destination);
    master.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(ctx.destination);
    const channels = Array.from({ length: 16 }, (_, number) => ({ program: PROGRAM[number] || 0, volume: 100, pan: 64, expression: 127, bend: 8192 }));
    const base = ctx.currentTime + .08, buffer = noise(ctx), lookAhead = 2, interval = 80;
    let cursor = 0;
    const end = Math.max(secondsAt(song.endTick, tempos, song.division), ...notes.map(note => note.at + note.length));
    const pump = () => {
      const limit = ctx.currentTime - base + lookAhead;
      while (cursor < notes.length && notes[cursor].at <= limit) {
        const note = notes[cursor++];
        playNote(ctx, buffer, master, channels[note.event.channel], note.event, base + note.at, note.length);
      }
      if (cursor === notes.length) clearInterval(timer);
    };
    let timer;
    pump();
    timer = setInterval(pump, interval);
    onEnd(end);
  };
  if (ctx.state === 'suspended') ctx.resume().then(start).catch(error => { console.error(error); onEnd(0); }); else start();
}
