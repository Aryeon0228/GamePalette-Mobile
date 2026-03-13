import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  Share,
  Animated,
  Easing,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import ViewShot from 'react-native-view-shot';
import { usePaletteStore, SavedPalette } from '../store/paletteStore';
import { useThemeStore } from '../store/themeStore';
import ExportModal from './home/modals/ExportModal';
import { type AppLanguage } from '../lib/colorUtils';
import { COLOR_TOKENS, SHADOW_TOKENS, RADIUS_TOKENS, OVERLAY_TOKENS, BLUR_INTENSITY } from '../constants/designTokens';

const C = COLOR_TOKENS;

interface LibraryScreenProps {
  onNavigateBack: () => void;
  language: AppLanguage;
}

export default function LibraryScreen({ onNavigateBack, language }: LibraryScreenProps) {
  const { savedPalettes, deletePalette, loadPalette } = usePaletteStore();
  const { colors: theme } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const isKorean = language === 'ko';

  // Dynamic styles based on theme
  const dynamicStyles = {
    container: { backgroundColor: theme.background },
    card: { backgroundColor: theme.backgroundSecondary },
    text: { color: theme.textPrimary },
    textSecondary: { color: theme.textSecondary },
    border: { borderColor: theme.border },
  };
  const menuAnimScale = useRef(new Animated.Value(0.85)).current;
  const menuAnimOpacity = useRef(new Animated.Value(0)).current;

  const [menuPalette, setMenuPalette] = useState<SavedPalette | null>(null);
  const [exportPalette, setExportPalette] = useState<SavedPalette | null>(null);
  const [snsExportPalette, setSnsExportPalette] = useState<SavedPalette | null>(null);
  const [snsCardType, setSnsCardType] = useState<'instagram' | 'twitter'>('instagram');
  const [cardShowHex, setCardShowHex] = useState(true);
  const [cardShowStats, setCardShowStats] = useState(true);
  const [cardShowHistogram, setCardShowHistogram] = useState(true);
  const [exportFormat, setExportFormat] = useState<'png' | 'json' | 'css'>('png');
  const [isExporting, setIsExporting] = useState(false);
  const paletteCardRef = useRef<ViewShot>(null);

  React.useEffect(() => {
    if (menuPalette !== null) {
      Animated.parallel([
        Animated.spring(menuAnimScale, {
          toValue: 1,
          friction: 7,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(menuAnimOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      menuAnimScale.setValue(0.85);
      menuAnimOpacity.setValue(0);
    }
  }, [menuPalette, menuAnimScale, menuAnimOpacity]);
  const t = {
    copiedTitle: isKorean ? '복사됨!' : 'Copied!',
    deletePaletteTitle: isKorean ? '팔레트 삭제' : 'Delete Palette',
    deletePaletteMessage: (name: string) => (isKorean
      ? `"${name}" 팔레트를 삭제할까요?`
      : `Are you sure you want to delete "${name}"?`),
    cancel: isKorean ? '취소' : 'Cancel',
    delete: isKorean ? '삭제' : 'Delete',
    jsonCopied: isKorean ? 'JSON이 클립보드에 복사되었습니다' : 'JSON copied to clipboard',
    cssCopied: isKorean ? 'CSS 변수가 클립보드에 복사되었습니다' : 'CSS variables copied to clipboard',
    hexCopied: isKorean ? 'HEX 값이 클립보드에 복사되었습니다' : 'HEX values copied to clipboard',
    paletteSharedSuffix: isKorean ? 'Pixel Paw로 제작됨' : 'Created with Pixel Paw',
    shareDialogTitle: isKorean ? '팔레트 공유' : 'Share Palette',
    exportImageFailed: isKorean ? '팔레트 이미지를 내보내지 못했습니다.' : 'Failed to export palette image.',
    exportFailed: isKorean ? '팔레트를 내보내지 못했습니다.' : 'Failed to export palette.',
    copiedFormat: (format: string) => (isKorean
      ? `${format.toUpperCase()}이(가) 클립보드에 복사되었습니다`
      : `${format.toUpperCase()} copied to clipboard`),
    paletteWord: isKorean ? '팔레트' : 'PALETTE',
    colorsSuffix: isKorean ? '색상' : 'colors',
    export: isKorean ? '내보내기' : 'Export',
    title: isKorean ? '라이브러리' : 'Library',
    searchPlaceholder: isKorean ? '팔레트, 색상 검색...' : 'Search palettes, colors...',
    sectionTitle: isKorean ? '내 팔레트' : 'My Palettes',
    itemSuffix: isKorean ? '개' : 'items',
    noSavedTitle: isKorean ? '저장된 팔레트가 없어요' : 'No saved palettes',
    noSavedSubtitle: isKorean
      ? '이미지에서 색상을 추출하고 저장하면 여기에 표시됩니다'
      : 'Extract colors from an image and save them to see them here',
    noResultTitle: isKorean ? '검색 결과가 없어요' : 'No results found',
    noResultSubtitle: isKorean ? '다른 검색어를 입력해 보세요' : 'Try a different search term',
    open: isKorean ? '열기' : 'Open',
    share: isKorean ? '공유' : 'Share',
    exportPaletteTitle: isKorean ? '팔레트 내보내기' : 'Export Palette',
  };

  // Filter palettes based on search
  const filteredPalettes = useMemo(() => {
    if (!searchQuery.trim()) return savedPalettes;
    const query = searchQuery.toLowerCase();
    return savedPalettes.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.colors.some((c) => c.toLowerCase().includes(query))
    );
  }, [savedPalettes, searchQuery]);

  const handleLoadPalette = (palette: SavedPalette) => {
    loadPalette(palette);
    onNavigateBack();
  };

  const handleDeletePalette = (palette: SavedPalette) => {
    setMenuPalette(null);
    Alert.alert(
      t.deletePaletteTitle,
      t.deletePaletteMessage(palette.name),
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: () => deletePalette(palette.id),
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(isKorean ? 'ko-KR' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Export functions
  const exportAsJSON = async (palette: SavedPalette) => {
    const json = JSON.stringify(
      {
        name: palette.name,
        colors: palette.colors,
        createdAt: new Date(palette.createdAt).toISOString(),
      },
      null,
      2
    );
    await Clipboard.setStringAsync(json);
    Alert.alert(t.copiedTitle, t.jsonCopied);
    setExportPalette(null);
  };

  const exportAsCSS = async (palette: SavedPalette) => {
    const css = `:root {\n${palette.colors
      .map((c, i) => `  --color-${i + 1}: ${c};`)
      .join('\n')}\n}`;
    await Clipboard.setStringAsync(css);
    Alert.alert(t.copiedTitle, t.cssCopied);
    setExportPalette(null);
  };

  const exportAsHEX = async (palette: SavedPalette) => {
    const hex = palette.colors.join('\n');
    await Clipboard.setStringAsync(hex);
    Alert.alert(t.copiedTitle, t.hexCopied);
    setExportPalette(null);
  };

  const sharePalette = async (palette: SavedPalette) => {
    try {
      await Share.share({
        message: `${palette.name}\n\n${isKorean ? '색상' : 'Colors'}:\n${palette.colors.join('\n')}\n\n${t.paletteSharedSuffix}`,
      });
    } catch (error) {
      if (__DEV__) console.error(error);
    }
    setExportPalette(null);
  };

  const sanitizeName = (name: string): string => {
    const cleaned = name.toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/^-+|-+$/g, '');
    return cleaned || 'palette';
  };

  const buildPaletteExport = (
    palette: SavedPalette,
    format: 'json' | 'css' | 'text'
  ): { content: string; filename: string } => {
    const base = sanitizeName(palette.name);
    if (format === 'json') {
      return {
        content: JSON.stringify(
          {
            name: palette.name,
            colors: palette.colors,
            createdAt: new Date(palette.createdAt).toISOString(),
          },
          null,
          2
        ),
        filename: `${base}.json`,
      };
    }
    if (format === 'css') {
      return {
        content: `:root {\n${palette.colors.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n')}\n}`,
        filename: `${base}.css`,
      };
    }
    return {
      content: palette.colors.join('\n'),
      filename: `${base}.txt`,
    };
  };

  const exportSnsAsPng = async () => {
    if (!paletteCardRef.current) return;
    setIsExporting(true);
    try {
      const uri = await paletteCardRef.current.capture?.();
      if (uri && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: t.shareDialogTitle,
        });
      }
    } catch (error) {
      if (__DEV__) console.error('SNS PNG export error:', error);
      Alert.alert(t.exportPaletteTitle, t.exportImageFailed);
    } finally {
      setIsExporting(false);
    }
  };

  const exportSnsAsText = async (format: 'json' | 'css') => {
    if (!snsExportPalette) return;
    setIsExporting(true);
    let fileUri: string | null = null;
    try {
      const { content, filename } = buildPaletteExport(snsExportPalette, format);
      fileUri = FileSystem.cacheDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, content);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }
    } catch (error) {
      if (__DEV__) console.error('SNS text export error:', error);
      Alert.alert(t.exportPaletteTitle, t.exportFailed);
    } finally {
      if (fileUri) {
        FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => undefined);
      }
      setIsExporting(false);
    }
  };

  const handleSnsExportConfirm = async () => {
    if (!snsExportPalette) return;
    if (exportFormat === 'png') {
      await exportSnsAsPng();
    } else {
      await exportSnsAsText(exportFormat);
    }
    setSnsExportPalette(null);
  };

  const copySnsToClipboard = async (format: string) => {
    if (!snsExportPalette) return;

    let content = '';
    if (format === 'json') {
      content = buildPaletteExport(snsExportPalette, 'json').content;
    } else if (format === 'css') {
      content = buildPaletteExport(snsExportPalette, 'css').content;
    } else {
      content = snsExportPalette.colors.join('\n');
    }

    await Clipboard.setStringAsync(content);
    Alert.alert(t.copiedTitle, t.copiedFormat(format));
  };

  const renderPaletteCard = ({ item }: { item: SavedPalette }) => (
    <View style={styles.card}>
      <BlurView intensity={BLUR_INTENSITY.heavy} tint="light" style={StyleSheet.absoluteFillObject} />
      {/* Header with thumbnail and menu */}
      <View style={styles.cardHeader}>
        <TouchableOpacity
          style={styles.cardTouchable}
          onPress={() => handleLoadPalette(item)}
          activeOpacity={0.8}
        >
          <View style={[styles.thumbnail, { backgroundColor: theme.backgroundTertiary }]}>
            {item.imageUri ? (
              <Image source={{ uri: item.imageUri }} style={styles.thumbnailImage} />
            ) : (
              <View style={[styles.thumbnailPlaceholder, { backgroundColor: theme.backgroundTertiary }]}>
                <Ionicons name="color-palette" size={20} color={theme.textMuted} />
              </View>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuPalette(item)}
        >
          <Ionicons name="ellipsis-horizontal" size={18} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Color swatches */}
      <TouchableOpacity
        style={styles.colorSwatches}
        onPress={() => handleLoadPalette(item)}
        activeOpacity={0.8}
      >
        {item.colors.slice(0, 5).map((color, index) => (
          <View
            key={`${item.id}-${index}`}
            style={[styles.colorSwatch, { backgroundColor: color }]}
          />
        ))}
      </TouchableOpacity>

      {/* Info section */}
      <View style={styles.cardInfo}>
        <View style={styles.cardTitleRow}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.paletteLabel, { color: theme.textMuted }]}>{t.paletteWord}</Text>
        </View>

        {/* Tags */}
        <View style={styles.tagsRow}>
          <View style={[styles.tag, { backgroundColor: theme.borderLight }]}>
            <Text style={[styles.tagText, { color: theme.textSecondary }]}>HEX</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: theme.borderLight }]}>
            <Text style={[styles.tagText, { color: theme.textSecondary }]}>
              {item.colors.length} {t.colorsSuffix}
            </Text>
          </View>
          <Text style={[styles.dateText, { color: theme.textMuted }]}>{formatDate(item.createdAt)}</Text>
        </View>

        {/* Export button */}
        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: theme.buttonBg }]}
          onPress={() => setExportPalette(item)}
        >
          <Ionicons name="share-outline" size={14} color={theme.textPrimary} />
          <Text style={[styles.exportButtonText, { color: theme.textPrimary }]}>{t.export}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.backgroundSecondary }]} onPress={onNavigateBack}>
          <Ionicons name="chevron-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{t.title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.backgroundSecondary }]}>
          <Ionicons name="search" size={18} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder={t.searchPlaceholder}
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Section header */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t.sectionTitle}</Text>
        <Text style={[styles.sectionCount, { color: theme.textMuted }]}>
          {filteredPalettes.length} {t.itemSuffix}
        </Text>
      </View>

      {/* Content */}
      {savedPalettes.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: theme.backgroundSecondary }]}>
            <Ionicons name="color-palette-outline" size={48} color={theme.textMuted} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>{t.noSavedTitle}</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
            {t.noSavedSubtitle}
          </Text>
        </View>
      ) : filteredPalettes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>{t.noResultTitle}</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
            {t.noResultSubtitle}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPalettes}
          renderItem={renderPaletteCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Context menu modal */}
      <Modal
        visible={menuPalette !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuPalette(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuPalette(null)}
        >
          <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
          <Animated.View style={[
            styles.menuModal,
            {
              opacity: menuAnimOpacity,
              transform: [{ scale: menuAnimScale }]
            }
          ]}>
            <BlurView intensity={BLUR_INTENSITY.medium} tint="light" style={StyleSheet.absoluteFillObject} />
            <Text style={[styles.menuTitle, { color: theme.textPrimary, borderBottomColor: theme.border }]}>
              {menuPalette?.name}
            </Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                if (menuPalette) handleLoadPalette(menuPalette);
                setMenuPalette(null);
              }}
            >
              <Ionicons name="open-outline" size={20} color={theme.textPrimary} />
              <Text style={[styles.menuItemText, { color: theme.textPrimary }]}>{t.open}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                if (menuPalette) setExportPalette(menuPalette);
                setMenuPalette(null);
              }}
            >
              <Ionicons name="share-outline" size={20} color={theme.textPrimary} />
              <Text style={[styles.menuItemText, { color: theme.textPrimary }]}>{t.export}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemDanger, { borderTopColor: theme.border }]}
              onPress={() => menuPalette && handleDeletePalette(menuPalette)}
            >
              <Ionicons name="trash-outline" size={20} color={C.danger} />
              <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>
                {t.delete}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Export modal */}
      <Modal
        visible={exportPalette !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setExportPalette(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setExportPalette(null)}
        >
          <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
          <View style={styles.exportModal}>
            <BlurView intensity={BLUR_INTENSITY.medium} tint="light" style={StyleSheet.absoluteFillObject} />
            <View style={[styles.exportHandle, { backgroundColor: theme.border }]} />
            <Text style={[styles.exportTitle, { color: theme.textPrimary }]}>{t.exportPaletteTitle}</Text>

            <View style={styles.exportOptions}>
              <TouchableOpacity
                style={styles.exportOption}
                onPress={() => exportPalette && exportAsHEX(exportPalette)}
              >
                <View style={[styles.exportIcon, { backgroundColor: C.accentInteractive }]}>
                  <Text style={styles.exportIconText}>#</Text>
                </View>
                <Text style={[styles.exportOptionText, { color: theme.textSecondary }]}>HEX</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.exportOption}
                onPress={() => exportPalette && exportAsJSON(exportPalette)}
              >
                <View style={[styles.exportIcon, { backgroundColor: C.exportJson }]}>
                  <Ionicons name="code-slash" size={20} color="#fff" />
                </View>
                <Text style={[styles.exportOptionText, { color: theme.textSecondary }]}>JSON</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.exportOption}
                onPress={() => exportPalette && exportAsCSS(exportPalette)}
              >
                <View style={[styles.exportIcon, { backgroundColor: C.exportCss }]}>
                  <Text style={styles.exportIconText}>CSS</Text>
                </View>
                <Text style={[styles.exportOptionText, { color: theme.textSecondary }]}>CSS</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.exportOption}
                onPress={() => exportPalette && sharePalette(exportPalette)}
              >
                <View style={[styles.exportIcon, { backgroundColor: C.accentMuted }]}>
                  <Ionicons name="share-social" size={20} color="#fff" />
                </View>
                <Text style={[styles.exportOptionText, { color: theme.textSecondary }]}>{t.share}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.exportOption}
                onPress={() => {
                  if (!exportPalette) return;
                  setSnsCardType('instagram');
                  setExportFormat('png');
                  setSnsExportPalette(exportPalette);
                  setExportPalette(null);
                }}
              >
                <View style={[styles.exportIcon, { backgroundColor: C.brandInstagram }]}>
                  <Ionicons name="logo-instagram" size={20} color="#fff" />
                </View>
                <Text style={[styles.exportOptionText, { color: theme.textSecondary }]}>Instagram</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.exportOption}
                onPress={() => {
                  if (!exportPalette) return;
                  setSnsCardType('twitter');
                  setExportFormat('png');
                  setSnsExportPalette(exportPalette);
                  setExportPalette(null);
                }}
              >
                <View style={[styles.exportIcon, { backgroundColor: C.brandTwitter }]}>
                  <Ionicons name="logo-twitter" size={20} color="#fff" />
                </View>
                <Text style={[styles.exportOptionText, { color: theme.textSecondary }]}>Twitter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <ExportModal
        visible={snsExportPalette !== null}
        theme={theme}
        language={language}
        snsCardType={snsCardType}
        onSnsCardTypeChange={setSnsCardType}
        cardShowHex={cardShowHex}
        onCardShowHexChange={setCardShowHex}
        cardShowStats={cardShowStats}
        onCardShowStatsChange={setCardShowStats}
        cardShowHistogram={cardShowHistogram}
        onCardShowHistogramChange={setCardShowHistogram}
        paletteCardRef={paletteCardRef}
        processedColors={snsExportPalette?.colors ?? []}
        currentImageUri={snsExportPalette?.imageUri ?? null}
        histogram={null}
        exportFormat={exportFormat}
        onExportFormatChange={setExportFormat}
        isExporting={isExporting}
        onExportConfirm={handleSnsExportConfirm}
        onCopyToClipboard={copySnsToClipboard}
        onClose={() => setSnsExportPalette(null)}
        onHapticLight={() => { }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.backgroundApp,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW_TOKENS.subtle,
  },
  headerTitle: {
    fontSize: 19,
    fontFamily: 'Pretendard-SemiBold',
    fontWeight: '600',
    color: C.textPrimary,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.backgroundElevated,
    borderRadius: RADIUS_TOKENS.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    ...SHADOW_TOKENS.none,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: C.textPrimary,
    padding: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Pretendard-Bold',
    fontWeight: '700',
    color: C.textPrimary,
  },
  sectionCount: {
    fontSize: 15,
    fontFamily: 'Pretendard-Regular',
    color: C.textMuted,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    gap: 16,
  },
  card: {
    flex: 1,
    backgroundColor: OVERLAY_TOKENS.blurSurfaceHeavy,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    ...SHADOW_TOKENS.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardTouchable: {
    flex: 1,
  },
  thumbnail: {
    height: 140,
    backgroundColor: C.backgroundSurfaceAlt,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbnailPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.backgroundSurfaceAlt,
  },
  menuButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: OVERLAY_TOKENS.scrimLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSwatches: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 8,
  },
  colorSwatch: {
    flex: 1,
    height: 32,
    borderRadius: RADIUS_TOKENS.sm,
  },
  cardInfo: {
    padding: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontFamily: 'Pretendard-SemiBold',
    fontWeight: '600',
    color: C.textPrimary,
    flex: 1,
  },
  paletteLabel: {
    fontSize: 11,
    fontFamily: 'Pretendard-SemiBold',
    fontWeight: '600',
    color: C.textMuted,
    letterSpacing: 0.5,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: C.borderSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    color: C.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: C.textSubtle,
    marginLeft: 'auto',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.backgroundSurfaceAlt,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    ...SHADOW_TOKENS.none,
  },
  exportButtonText: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    fontWeight: '600',
    color: C.textPrimary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...SHADOW_TOKENS.subtle,
  },
  emptyTitle: {
    fontSize: 19,
    fontFamily: 'Pretendard-SemiBold',
    fontWeight: '600',
    color: C.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: 'Pretendard-Regular',
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  menuModal: {
    backgroundColor: OVERLAY_TOKENS.blurSurfaceMedium,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    overflow: 'hidden',
    ...SHADOW_TOKENS.elevated,
  },
  menuTitle: {
    fontSize: 17,
    fontFamily: 'Pretendard-SemiBold',
    fontWeight: '600',
    color: C.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.borderSoft,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  menuItemText: {
    fontSize: 17,
    fontFamily: 'Pretendard-Regular',
    color: C.textPrimary,
  },
  menuItemDanger: {
    borderTopWidth: 1,
    borderTopColor: C.borderSoft,
    marginTop: 8,
    paddingTop: 20,
  },
  menuItemTextDanger: {
    color: C.danger,
  },
  exportModal: {
    backgroundColor: OVERLAY_TOKENS.blurSurfaceMedium,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 20,
    overflow: 'hidden',
    ...SHADOW_TOKENS.elevated,
  },
  exportHandle: {
    width: 36,
    height: 4,
    backgroundColor: C.borderHandle,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  exportTitle: {
    fontSize: 19,
    fontFamily: 'Pretendard-SemiBold',
    fontWeight: '600',
    color: C.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
  },
  exportOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  exportOption: {
    alignItems: 'center',
    gap: 8,
    width: '30%',
    marginBottom: 14,
  },
  exportIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW_TOKENS.none,
  },
  exportIconText: {
    fontSize: 17,
    fontFamily: 'Pretendard-Bold',
    fontWeight: '700',
    color: '#fff',
  },
  exportOptionText: {
    fontSize: 13,
    color: C.textSecondary,
    fontFamily: 'Pretendard-Medium',
    fontWeight: '500',
  },
});
