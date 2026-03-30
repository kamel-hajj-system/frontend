import React, { useEffect, useMemo, useState } from 'react';
import {
  resolveNationalityIso2ForFlag,
  iso2ToFlagEmoji,
  nationalityLetterFallback,
} from '../../utils/flags';

/** Pinned version — SVGs from npm package `country-flag-icons` via jsDelivr / unpkg. */
const FLAG_ICONS_VERSION = '1.5.11';

function svgUrl(iso, mirror) {
  const u = iso.toUpperCase();
  if (mirror === 0) {
    return `https://cdn.jsdelivr.net/npm/country-flag-icons@${FLAG_ICONS_VERSION}/3x2/${u}.svg`;
  }
  return `https://unpkg.com/country-flag-icons@${FLAG_ICONS_VERSION}/3x2/${u}.svg`;
}

const SIZES = {
  default: { w: 56, h: 40, emoji: 26, letter: 16 },
  card: { w: 112, h: 75, emoji: 40, letter: 22 },
  /** Full-width strip; width comes from container. */
  banner: { h: 76, emoji: 48, letter: 28 },
};

/**
 * Flag from `flagCode` (ISO2 / common ISO3). Not from free-form `code`.
 * @param {'default'|'card'|'banner'} [variant='default'] — `card`: larger fixed box; `banner`: full-width top strip.
 */
export function NationalityFlagImage({ flagCode, nat, token, variant = 'default' }) {
  const iso = resolveNationalityIso2ForFlag(flagCode);
  const [mirror, setMirror] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setMirror(0);
    setImgFailed(false);
  }, [iso]);

  const src = useMemo(() => (iso ? svgUrl(iso, mirror) : null), [iso, mirror]);

  const emoji = iso ? iso2ToFlagEmoji(iso) : null;
  const letter = nationalityLetterFallback(nat);

  const sizePreset = variant === 'banner' ? SIZES.banner : (SIZES[variant] ?? SIZES.default);
  const isBanner = variant === 'banner';
  const isCard = variant === 'card';
  const w = isBanner ? '100%' : sizePreset.w;
  const h = sizePreset.h;
  const emojiSize = sizePreset.emoji;
  const letterSize = sizePreset.letter;

  const boxStyle = {
    width: w,
    height: h,
    borderRadius: isBanner ? 0 : isCard ? token.borderRadiusLG * 1.25 : token.borderRadius,
    overflow: 'hidden',
    flexShrink: isBanner ? undefined : 0,
    background: isCard || isBanner ? token.colorPrimaryBg : token.colorFillQuaternary,
    border: isBanner ? 'none' : `1px solid ${token.colorBorderSecondary}`,
    boxShadow: isCard ? token.boxShadowTertiary : undefined,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const onImgError = () => {
    if (mirror === 0) {
      setMirror(1);
      return;
    }
    setImgFailed(true);
  };

  if (!iso) {
    return (
      <div style={boxStyle} aria-hidden>
        <span style={{ fontSize: letterSize, fontWeight: 700, color: token.colorTextSecondary }}>{letter}</span>
      </div>
    );
  }

  if (imgFailed && emoji) {
    return (
      <div style={boxStyle} aria-hidden>
        <span style={{ fontSize: emojiSize, lineHeight: 1 }}>{emoji}</span>
      </div>
    );
  }

  if (imgFailed) {
    return (
      <div style={boxStyle} aria-hidden>
        <span style={{ fontSize: letterSize, fontWeight: 700, color: token.colorTextSecondary }}>{letter}</span>
      </div>
    );
  }

  return (
    <div style={boxStyle}>
      <img
        key={src}
        src={src}
        alt=""
        width={typeof w === 'number' ? w : undefined}
        height={typeof h === 'number' ? h : undefined}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={onImgError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          display: 'block',
        }}
      />
    </div>
  );
}
