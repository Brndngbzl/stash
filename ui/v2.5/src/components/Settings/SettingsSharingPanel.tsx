import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { useIntl } from "react-intl";
import { faCoins, faShareAlt } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "../Shared/Icon";
import { SettingSection } from "./SettingSection";
import {
  BooleanSetting,
  NumberSetting,
} from "./Inputs";
import { useToast } from "src/hooks/Toast";

// ---------------------------------------------------------------------------
// Types – will be replaced with generated GraphQL types once the backend
// implements the Sharing API (see graphql/schema/types/user.graphql).
// ---------------------------------------------------------------------------

interface ISharingConfig {
  enabled: boolean;
  enablePointSystem: boolean;
  watchCost: number;
  downloadCost: number;
  uploadReward: number;
  curationReward: number;
}

const defaultSharingConfig: ISharingConfig = {
  enabled: false,
  enablePointSystem: false,
  watchCost: 1,
  downloadCost: 5,
  uploadReward: 10,
  curationReward: 2,
};

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export const SettingsSharingPanel: React.FC = () => {
  const intl = useIntl();
  const Toast = useToast();

  // TODO: Replace with GraphQL query (FindSharingConfig) / mutation
  // (ConfigureSharing) once the backend implements the Sharing API.
  // See graphql/schema/types/user.graphql.
  const [config, setConfig] = useState<ISharingConfig>(defaultSharingConfig);

  function updateConfig(patch: Partial<ISharingConfig>) {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      // TODO: persist via configureSharing mutation.
      Toast.success(
        intl.formatMessage({ id: "config.sharing.toast.saved" })
      );
      return next;
    });
  }

  return (
    <div id="settings-sharing">
      <SettingSection headingID="config.sharing.heading">
        <BooleanSetting
          id="sharing-enabled"
          heading={
            <>
              <Icon icon={faShareAlt} className="mr-2" />
              {intl.formatMessage({ id: "config.sharing.enable" })}
            </>
          }
          subHeadingID="config.sharing.enable_desc"
          checked={config.enabled}
          onChange={(v) => updateConfig({ enabled: v })}
        />
      </SettingSection>

      <SettingSection
        headingID="config.sharing.point_system"
        advanced={false}
      >
        <BooleanSetting
          id="sharing-enable-points"
          heading={
            <>
              <Icon icon={faCoins} className="mr-2" />
              {intl.formatMessage({ id: "config.sharing.enable_points" })}
            </>
          }
          subHeadingID="config.sharing.enable_points_desc"
          checked={config.enablePointSystem}
          onChange={(v) => updateConfig({ enablePointSystem: v })}
        />

        <Form.Group
          className={config.enablePointSystem ? undefined : "text-muted"}
        >
          <NumberSetting
            id="sharing-watch-cost"
            headingID="config.sharing.watch_cost"
            subHeadingID="config.sharing.watch_cost_desc"
            value={config.watchCost}
            disabled={!config.enablePointSystem}
            onChange={(v) => updateConfig({ watchCost: v ?? 1 })}
          />

          <NumberSetting
            id="sharing-download-cost"
            headingID="config.sharing.download_cost"
            subHeadingID="config.sharing.download_cost_desc"
            value={config.downloadCost}
            disabled={!config.enablePointSystem}
            onChange={(v) => updateConfig({ downloadCost: v ?? 5 })}
          />

          <NumberSetting
            id="sharing-upload-reward"
            headingID="config.sharing.upload_reward"
            subHeadingID="config.sharing.upload_reward_desc"
            value={config.uploadReward}
            disabled={!config.enablePointSystem}
            onChange={(v) => updateConfig({ uploadReward: v ?? 10 })}
          />

          <NumberSetting
            id="sharing-curation-reward"
            headingID="config.sharing.curation_reward"
            subHeadingID="config.sharing.curation_reward_desc"
            value={config.curationReward}
            disabled={!config.enablePointSystem}
            onChange={(v) => updateConfig({ curationReward: v ?? 2 })}
          />
        </Form.Group>
      </SettingSection>
    </div>
  );
};
