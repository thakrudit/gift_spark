import { useState, useEffect, useCallback } from "react";
import { Layout, LegacyCard, Button, TextField, Thumbnail, Text, EmptyState, SkeletonBodyText, TextContainer, SkeletonDisplayText } from "@shopify/polaris";
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
    const [gift, setGift] = useState({
        _id: "",
        id: "",
        title: "",
        media: [],
    });

    const [title, setTitle] = useState("");
    const [giftUrl, setGiftUrl] = useState(svgImage);
    const [error, setError] = useState({});

    const [isLoading, setIsLoading] = useState(false);
    const [isPopulating, setIsPopulating] = useState({
        submit: false,
        remove: false,
        edit: false
    });
    const setLoading = (flag) => {
        shopify.loading(flag);
        setIsLoading(flag);
    }
    const setPopulating = (flag, key) => {
        shopify.loading(flag);
        setIsPopulating(prev => ({ ...prev, [key]: flag }));
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

            setError(prev => ({ ...prev, resources: "" }))
            setError(prev => ({ ...prev, totalInventory: "" }))

            if (selectedProducts?.length > 0) {
                setTitle(`Free ${selectedProducts[0].title}`);
                setGiftUrl(giftImage);
                setError(prev => ({ ...prev, title: "" }))
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
        setError(prev => ({ ...prev, title: "" }))
    }, []);

    async function getFreeGift(shop) {
        setLoading(true);
        let result = await apiHelper.getRequest(`/api/v1/get-free-gift?shop=${shop}`);
        if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
            setGift(result?.body);
            setLoading(false);
        } else {
            setGift({
                _id: "",
                id: "",
                title: "",
                media: [],
            })
            setLoading(false);
        }
    }

    useEffect(() => {
        getFreeGift(shop);
    }, [shop]);

    // Validation
    const handleCheckGenerateGift = () => {
        let isValid = true;

        if (resources?.length == 0) {
            setError(prev => ({ ...prev, resources: ERR_MESSAGE.EMPTY_PRODUCT }))
            isValid = false;
        } else {
            setError(prev => ({ ...prev, resources: "" }))
        }

        if (title.trim() == "") {
            setError(prev => ({ ...prev, title: ERR_MESSAGE.REQUIRED_TITLE }))
            isValid = false;
        } else {
            setError(prev => ({ ...prev, title: "" }))
        }

        if (resources?.length > 0) {
            if (resources[0].totalInventory == 0) {
                setError(prev => ({ ...prev, totalInventory: ERR_MESSAGE.NULL_QUANTITY }))
                isValid = false;
            } else {
                setError(prev => ({ ...prev, totalInventory: "" }))
            }
        }

        return isValid;
    };

    const handleCreateGiftProduct = async (e) => {
        e.preventDefault();
        if (!handleCheckGenerateGift()) {
            return;
        }
        setPopulating(true, "submit");
        let data = JSON.stringify({
            shop: shop,
            title: title,
            productPayload: resources[0]
        })
        let result = await apiHelper.postRequest("/api/v1/create-free-gift", data)
        if (result?.code == DEVELOPMENT_CONFIG.statusCode) {
            setGift(result?.body);
            setResources([]);
            setTitle("");
            setGiftUrl(svgImage);
            shopify.toast.show(result?.message);
            setPopulating(false, "submit");
        } else {
            shopify.toast.show(result?.message, { isError: true });
            setPopulating(false, "submit");
        }
    };

    const onDelete = async (e, gId) => {
        e.preventDefault();
        setPopulating(true, "remove");
        let data = JSON.stringify({
            gId: gId,
            shop: shop
        })
        let result = await apiHelper.postRequest("/api/v1/remove-free-gift", data)
        if (result?.code == DEVELOPMENT_CONFIG.statusCode) {
            setGift({
                _id: "",
                id: "",
                title: "",
                media: [],
            })
            shopify.toast.show(result?.message)
            setPopulating(false, "remove");
        } else {
            shopify.toast.show(result?.message, { isError: true })
            setPopulating(false, "remove");
        }
    }

    const onEdit = async (e, gId) => {
        e.preventDefault();
        setPopulating(true, "edit");
        const productId = gId.split("/").pop();
        const redirect = Redirect.create(app);
        redirect.dispatch(Redirect.Action.ADMIN_SECTION, {
            name: Redirect.ResourceType.Product,
            resource: {
                id: productId,
            },
        })
        setPopulating(false, "edit");
    }
    const gftImg = gift?.media[0]?.originalSource || svgImage;

    if (isLoading) {
        return (
            <Layout>
                <Layout.Section>
                    <LegacyCard sectioned>
                        <TextContainer>
                            <SkeletonDisplayText size="small" />
                            <SkeletonBodyText />
                        </TextContainer>
                    </LegacyCard>

                    <LegacyCard sectioned>
                        <TextContainer>
                            <SkeletonDisplayText size="small" />
                            <SkeletonBodyText />
                        </TextContainer>
                    </LegacyCard>

                    <LegacyCard sectioned>
                        <SkeletonBodyText />
                    </LegacyCard>

                </Layout.Section>
                <Layout.Section secondary></Layout.Section>
            </Layout>
        );
    }

    return (
        <Layout>
            <Layout.Section>
                <LegacyCard sectioned>
                    <Button onClick={openProductPicker}>Select</Button>
                    {error?.resources && (<div className="text-red-600 mt-2">{error?.resources}</div>)}
                    <TextField
                        label="Product Title"
                        value={title}
                        onChange={handleChange}
                        autoComplete="off"
                    />
                    {error?.title && (<div className="text-red-600 mt-2">{error?.title}</div>)}
                </LegacyCard>

                <LegacyCard sectioned>
                    <Button
                        onClick={handleCreateGiftProduct}
                        disabled={!!gift?.id}
                        loading={isPopulating?.submit}
                    >
                        Create Gift
                    </Button>

                    {error?.totalInventory && (<div className="text-red-600 mt-2">{error?.totalInventory}</div>)}
                    <Thumbnail source={giftUrl} alt="Product Image" />
                </LegacyCard>

                <LegacyCard sectioned>
                    {gift && gift?.id ? (
                        <>
                            <Thumbnail source={gftImg} alt="Gift Img" />
                            <Text variant="headingMd" as="h2">
                                {gift.title}
                            </Text>
                            <Button
                                onClick={(e) => onDelete(e, gift.id)}
                                // disabled={!!gift?.id}
                                loading={isPopulating?.remove}
                            >
                                Remove
                            </Button>
                            <Button
                                onClick={(e) => onEdit(e, gift.id)}
                                // disabled={!!gift?.id}
                                loading={isPopulating?.edit}
                            >
                                Edit
                            </Button>
                        </>
                    ) : (
                        <Text variant="headingMd" as="h2">
                            No Gift Available
                        </Text>
                    )}
                </LegacyCard>
            </Layout.Section>
            <Layout.Section secondary></Layout.Section>
        </Layout>
    )
}
