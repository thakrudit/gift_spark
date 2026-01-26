import { useState, useEffect, useCallback } from "react";
import { Layout, LegacyCard, Button, TextField, Thumbnail, Text, EmptyState } from "@shopify/polaris";
import { ResourcePicker as ResourcePickerAction, Redirect } from "@shopify/app-bridge/actions";
import { useAppBridge } from "@shopify/app-bridge-react";
import { createApp } from "@shopify/app-bridge";
import { giftImage, svgImage } from "../assets";
import apiHelper from "../helper/apiHelper";
import ERR_MESSAGE from "../helper/errorHelper";
import DEVELOPMENT_CONFIG from "../helper/config";

export default function FreeGift() {
    const shopify = useAppBridge();
    const { shop } = shopify?.config || "";
    const { config } = shopify || {};

    const app = createApp(config);

    const [resources, setResources] = useState([]);
    const [resourcesError, setResourcesError] = useState("");

    const [gift, setGift] = useState({
        _id: "",
        id: "",
        title: "",
        media: [],
    });

    const [title, setTitle] = useState("");
    const [titleError, setTitleError] = useState("");
    const [giftUrl, setGiftUrl] = useState(svgImage);
    const [totalInventoryError, setTotalInventoryError] = useState("");

    const [isLoading, setLoading] = useState(false);
    const [isPopulating, setIsPopulating] = useState(false);
    const setPopulating = (flag) => {
        shopify.loading(flag);
        setIsPopulating(flag);
    };

    // Product ResourcePicker
    const openProductPicker = () => {
        const productWithAllVariantsSelected = resources.map((product) => ({
            id: product.id,
        }));

        const picker = ResourcePickerAction.create(app, {
            resourceType: ResourcePickerAction.ResourceType.Product,
            options: {
                showVariants: false,
                initialSelectionIds: productWithAllVariantsSelected,
                selectMultiple: false,
            },
        });

        const handleSelection = async (payload) => {
            const selectedProducts = payload.selection;

            setResources((prevResources) => {
                const prevProductIds = prevResources.map((product) => product.id);

                const updatedResources = prevResources.filter((product) =>
                    selectedProducts.some((selected) => selected.id === product.id)
                );

                const newSelections = selectedProducts.filter(
                    (selected) => !prevProductIds.includes(selected.id)
                );

                return [...updatedResources, ...newSelections];
            });

            setResourcesError("");
            setTotalInventoryError("");

            if (selectedProducts?.length > 0) {
                setTitle(`Free ${selectedProducts[0].title}`);
                setGiftUrl(giftImage);
                setTitleError("");
            } else {
                setTitle("");
                setGiftUrl(svgImage);
            }

            picker.unsubscribe();
        };

        const handleCancel = () => {
            picker.unsubscribe();
        };

        picker.subscribe(ResourcePickerAction.Action.SELECT, handleSelection);
        picker.subscribe(ResourcePickerAction.Action.CANCEL, handleCancel);

        picker.dispatch(ResourcePickerAction.Action.OPEN);
    };

    // Set Title
    const handleChange = useCallback((newValue) => {
        setTitle(newValue);
        setTitleError("");
    }, []);

    async function getFreeGift(shop) {
        setPopulating(true);
        let result = await apiHelper.getRequest(`/api/v1/get-free-gift?shop=${shop}`);
        if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
            setGift(result?.body);
            setPopulating(false);
        } else {
            setGift({
                _id: "",
                id: "",
                title: "",
                media: [],
            })
            setPopulating(false);
        }
    }

    useEffect(() => {
        getFreeGift(shop);
    }, [shop]);

    // Validation
    const handleCheckGenerateGift = () => {
        let isValid = true;

        if (resources?.length == 0) {
            setResourcesError(ERR_MESSAGE.EMPTY_PRODUCT);
            isValid = false;
        } else {
            setResourcesError("");
        }

        if (title.trim() == "") {
            setTitleError(ERR_MESSAGE.REQUIRED_TITLE);
            isValid = false;
        } else {
            setTitleError("");
        }

        if (resources?.length > 0) {
            if (resources[0].totalInventory == 0) {
                setTotalInventoryError(ERR_MESSAGE.NULL_QUANTITY);
                isValid = false;
            } else {
                setTotalInventoryError("");
            }
        }

        return isValid;
    };

    const handleCreateGiftProduct = async (e) => {
        e.preventDefault();
        if (!handleCheckGenerateGift()) {
            return;
        }
        setPopulating(true);

        setTimeout(() => {
            setPopulating(false);
        }, 3000)
    };

    return (
        <Layout>
            <Layout.Section>
                <LegacyCard sectioned>
                    <Button onClick={openProductPicker}>Select</Button>
                    {resourcesError && (<div className="text-red-600 mt-2">{resourcesError}</div>)}
                    <TextField
                        label="Product Title"
                        value={title}
                        onChange={handleChange}
                        autoComplete="off"
                    />
                    {titleError && (<div className="text-red-600 mt-2">{titleError}</div>)}
                </LegacyCard>

                <LegacyCard sectioned>
                    <Button
                        onClick={handleCreateGiftProduct}
                        disabled={!!gift?.id}
                        loading={isPopulating}
                    >
                        Create Gift
                    </Button>
                    {totalInventoryError && (<div className="text-red-600 mt-2">{totalInventoryError}</div>)}
                    <Thumbnail source={giftUrl} alt="Product Image" />
                </LegacyCard>

                <LegacyCard sectioned>
                    {gift && gift?.id ? ( // && Object.keys(gift).length === 0
                        <>
                            <div key={gift.id} className="gift-card-3">
                                <Thumbnail source={gftImg} alt="Gift Img" />
                                <Text variant="headingMd" as="h2">
                                    {gift.title}
                                </Text>
                                <div className="icon-3">
                                    <Button
                                        aria-label="Delete gift card"
                                        className="icon-large"
                                        // onClick={(e) => onDelete(e, gift.id)}
                                        loading={isLoading}
                                    >
                                        Remove
                                    </Button>
                                    <Button
                                        aria-label="Delete gift card"
                                        className="icon-large"
                                    // onClick={() => onEdit(gift.id)}
                                    >
                                        Edit
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="gift-card-3">
                            <Text variant="headingMd" as="h2">
                                No Gift Available
                            </Text>
                        </div>
                    )}
                </LegacyCard>
            </Layout.Section>
            <Layout.Section secondary></Layout.Section>
        </Layout>
    )
}
