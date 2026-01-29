import { LegacyCard, Text, SettingToggle, Badge, SkeletonBodyText } from "@shopify/polaris";
import { useToggle } from "../../context/ToggleContext";

export function Toggle() {
  const { enabled, handleToggle, isPopulating, isLoading } = useToggle();

  const contentStatus = enabled ? "Turn off" : "Turn on";
  const badgeStatus = enabled ? 'success' : undefined;
  const badgeContent = enabled ? 'On' : 'Off';
  const settingStatusMarkup = (
    <Badge
      tone={badgeStatus}
      toneAndProgressLabelOverride={`App embeds ${badgeContent}`}
    >
      {badgeContent}
    </Badge>
  );

  if (isLoading) {
    return (
      <SkeletonBodyText />
    )
  }

  return (
    <LegacyCard title="App Embeds">
      <SettingToggle
        enabled={enabled}
        action={{
          content: contentStatus,
          onAction: handleToggle,
          loading: isPopulating,
        }}
      >
        <Text as="p">Turn on to use the App {settingStatusMarkup}</Text>
      </SettingToggle>
    </LegacyCard>
  );
}
