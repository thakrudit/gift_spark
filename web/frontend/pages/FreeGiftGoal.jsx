import React, { useEffect, useState } from 'react'
import { Button, ChoiceList, Layout, LegacyCard, ResourceItem, ResourceList, Select, SkeletonBodyText, SkeletonDisplayText, Text, TextContainer, TextField, Thumbnail } from '@shopify/polaris'
import { ResourcePicker as ResourcePickerAction, Redirect } from "@shopify/app-bridge/actions";
import { useNavigate } from 'react-router-dom';
import { useAppBridge } from '@shopify/app-bridge-react';
import apiHelper from '../helper/apiHelper';
import DEVELOPMENT_CONFIG from '../helper/config';
import { createApp } from '@shopify/app-bridge';
import { svgImage } from '../assets';
import ERR_MESSAGE from '../helper/errorHelper';

export default function FreeGiftGoal() {
    const shopify = useAppBridge();
    const { shop } = shopify?.config || "";
    const { config } = shopify || {};

    const app = createApp(config);

    const navigate = useNavigate();
    // Handel Back
    const handleBackToGoals = () => {
        navigate("/setGoals");
    };

    const [fields, setFields] = useState({
        title: "Free Gift",
        productId: "",
        tergetType: ["mp1"],
        minRequirement: "0",
        minQuantity: "0",
        eligibility: ["all"],
        allItems: true,
        specificItems: [],
        message1: "",
        message2: "",
    });
    const [error, setError] = useState({});

    const [search, setSearch] = useState("");

    const handleChange = (value, name) => {
        setFields(prevFields => ({
            ...prevFields,
            [name]: value
        }));
        setError(prevFields => ({
            ...prevFields,
            [name]: ""
        }))
    }

    const [isLoading, setIsLoading] = useState(false);
    const setLoading = (flag) => {
        shopify.loading(flag);
        setIsLoading(flag);
    }

    const [optionGift, setOptionGift] = useState(null);

    const options = optionGift
        ? [{ label: optionGift.title, value: optionGift._id, key: optionGift.id }]
        : [];

    async function getGiftProduct() {
        setLoading(true);
        let result = await apiHelper.getRequest(`/api/v1/get-free-gift?shop=${shop}`);
        if (result?.code === DEVELOPMENT_CONFIG.statusCode) {
            setOptionGift(result?.body);
            setLoading(false);
        } else {
            setLoading(false);
        }
    }

    useEffect(() => {
        getGiftProduct();
    }, [])

    const openProductPicker = () => {
        const productWithAllVariantsSelected = fields.specificItems.map((product) => ({
            id: product.id,
        }));

        const picker = ResourcePickerAction.create(app, {
            resourceType: ResourcePickerAction.ResourceType.Product,
            options: {
                showVariants: false,
                initialSelectionIds: productWithAllVariantsSelected,
            },
        });

        const handleSelection = async (payload) => {
            const selectedProducts = payload.selection;
            setFields((prev) => {
                const prevIds = new Set(prev.specificItems.map((item) => item.id));

                const kept = prev.specificItems.filter((item) =>
                    selectedProducts.some((selected) => selected.id === item.id)
                );

                const added = selectedProducts.filter((selected) => !prevIds.has(selected.id));

                return {
                    ...prev,
                    specificItems: [...kept, ...added],
                };
            })

            setError(prev => ({ ...prev, specificItems: "" }));

            picker.unsubscribe();
        };

        const handleCancel = () => {
            picker.unsubscribe();
        };

        picker.subscribe(ResourcePickerAction.Action.SELECT, handleSelection);
        picker.subscribe(ResourcePickerAction.Action.CANCEL, handleCancel);

        picker.dispatch(ResourcePickerAction.Action.OPEN);
    };

    // Remove Product From Picker
    const handleRemove = async (id) => {
        setFields((prev) => ({
            ...prev,
            specificItems: prev.specificItems.filter((item) => item.id !== id)
        }))
    };

    const [isPopulating, setIsPopulating] = useState();
    const setPopulating = (flag) => {
        shopify.loading(flag);
        setIsPopulating(flag);
    };

    let target = fields.tergetType[0] == "mp1" ? `you spend $ : ${fields.minRequirement}` : `minimum qunatity is : ${fields.minQuantity} `;
    const defaultMessage1 = `Get a <Strong> ${fields.title} </Strong> when ${target}`;
    const defaultMessage2 = `Congrats You Got a <Strong> ${fields.title} </Strong> !`;

    useEffect(() => {
        setFields((prev) => ({
            ...prev,
            message1: defaultMessage1,
            message2: defaultMessage2,
        }));
    }, [fields.title, fields.tergetType, fields.minRequirement, fields.minQuantity]);

    const handleValidate = () => {
        let isValid = true;

        const { title, productId, tergetType, minRequirement, minQuantity, eligibility, specificItems, message1, message2 } = fields;

        if (title?.trim() == "") {
            setError(prev => ({ ...prev, title: ERR_MESSAGE.GIFT_TITLE }))
            isValid = false;
        } else {
            setError(prev => ({ ...prev, title: "" }))
        }

        // if (productId?.trim() == "") {
        //     setError(prev => ({ ...prev, productId: ERR_MESSAGE.SELECT_GIFT }))
        //     isValid = false;
        // } else {
        //     setError(prev => ({ ...prev, productId: "" }))
        // }
        if (options?.length == 0) {
            setError(prev => ({ ...prev, productId: ERR_MESSAGE.EMPTY_GIFT }))
            isValid = false;
        }
        else if (productId?.trim() == "") {
            setError(prev => ({ ...prev, productId: ERR_MESSAGE.SELECT_GIFT }))
            isValid = false;
        }
        else {
            setError(prev => ({ ...prev, productId: "" }))
        }

        if (tergetType[0] == "mp1" && minRequirement == "") {
            setError(prev => ({ ...prev, minRequirement: ERR_MESSAGE.MIN_REQ }))
            isValid = false;
        } else {
            setError(prev => ({ ...prev, minRequirement: "" }))
        }

        if (tergetType[0] == "mp2" && minQuantity == "") {
            setError(prev => ({ ...prev, minQuantity: ERR_MESSAGE.MIN_QTY }))
            isValid = false;
        } else {
            setError(prev => ({ ...prev, minQuantity: "" }))
        }

        if (eligibility[0] == "prerequisite" && specificItems?.length == 0) {
            setError(prev => ({ ...prev, specificItems: ERR_MESSAGE.EMPTY_PRODUCT }))
            isValid = false;
        } else {
            setError(prev => ({ ...prev, specificItems: "" }))
        }

        if (message1?.trim() == "") {
            setError(prev => ({ ...prev, message1: ERR_MESSAGE.MSG }))
            isValid = false;
        } else {
            setError(prev => ({ ...prev, message1: "" }))
        }
        if (message2?.trim() == "") {
            setError(prev => ({ ...prev, message2: ERR_MESSAGE.MSG }))
            isValid = false;
        } else {
            setError(prev => ({ ...prev, message2: "" }))
        }

        return isValid;
    }

    const handleCreateGiftGoal = async (e) => {
        e.preventDefault();
        if (!handleValidate()) {
            return;
        }
        setPopulating(true);
        let { tergetType, minRequirement, minQuantity, specificItems, eligibility, allItems, ...payload } = fields;
        let data = JSON.stringify({
            shop,
            tergetType: fields.tergetType[0],
            minRequirement: fields.tergetType[0] == "mp1" ? parseFloat(fields.minRequirement) : 0,
            minQuantity: fields.tergetType[0] == "mp2" ? parseFloat(fields.minQuantity) : 0,
            eligibility: fields.eligibility[0],
            allItems: fields.eligibility[0] == "all" ? true : false,
            specificItems: fields.eligibility[0] == "prerequisite" ? fields.specificItems : [],
            ...payload
        })
        let result = await apiHelper.postRequest("/api/v1/create-gift-goal", data);
        if (result.code == DEVELOPMENT_CONFIG.statusCode) {
            setPopulating(false);
            shopify.toast.show(result?.message);
            navigate("/setGoals");
        } else {
            shopify.toast.show(result?.message, { isError: true });
            setPopulating(false);
        }
    }

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
                        <TextContainer>
                            <SkeletonDisplayText size="small" />
                            <SkeletonBodyText lines={4} />
                        </TextContainer>
                    </LegacyCard>

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
                        <TextContainer>
                            <SkeletonDisplayText size="small" />
                        </TextContainer>
                    </LegacyCard>
                </Layout.Section>
                <Layout.Section secondary></Layout.Section>
            </Layout>
        );
    }

    return (
        <Layout>
            <Layout.Section>
                <LegacyCard title="Goal Name" sectioned>
                    <TextField
                        label="Title"
                        type="text"
                        value={fields.title}
                        onChange={(value) => handleChange(value, "title")}
                    />
                    {error?.title && (<div className="text-red-600 mt-2">{error?.title}</div>)}
                </LegacyCard>
                <LegacyCard sectioned title="Goal Reward">
                    <Select
                        label="Which Gift The Customer Gets"
                        placeholder="Select Gift"
                        options={options}
                        value={fields.productId}
                        onChange={(value) => handleChange(value, "productId")}
                    />
                    {error?.productId && (<div className="text-red-600 mt-2">{error?.productId}</div>)}
                </LegacyCard>
                <LegacyCard sectioned title="Goal Target">
                    <ChoiceList
                        choices={[
                            {
                                label: "Cart Subtotal",
                                helpText:
                                    "Customer needs to reach a minimun subtotal to meet this goal",
                                value: "mp1",
                            },
                            {
                                label: "Cart Items Count",
                                helpText:
                                    "Customer needs to reach a minimun cart count in order to meet this goal",
                                value: "mp2",
                            },
                        ]}
                        selected={fields.tergetType}
                        onChange={(value) => handleChange(value, "tergetType")}
                    />
                    {fields.tergetType[0] == "mp1" && (
                        <>
                            <TextField
                                label="Minimum Requirement"
                                type="number"
                                value={fields.minRequirement}
                                onChange={(value) => handleChange(value, "minRequirement")}
                                prefix="$"
                                placeholder="0"
                                autoComplete="off"
                            />
                            {error?.minRequirement && (<div className="text-red-600 mt-2">{error?.minRequirement}</div>)}
                        </>
                    )}

                    {fields.tergetType[0] == "mp2" && (
                        <>
                            <TextField
                                label="Minimum Quantity"
                                type="number"
                                value={fields.minQuantity}
                                onChange={(value) => handleChange(value, "minQuantity")}
                                placeholder="0"
                                autoComplete="off"
                            />
                            {error?.minQuantity && (<div className="text-red-600 mt-2">{error?.minQuantity}</div>)}
                        </>
                    )}
                </LegacyCard>
                <LegacyCard sectioned title="Goal Target Applies To">
                    <ChoiceList
                        choices={[
                            { label: "All Items", value: "all" },
                            { label: "Included Items", value: "prerequisite" },
                        ]
                        }
                        selected={fields.eligibility}
                        onChange={(value) => handleChange(value, "eligibility")}
                    />
                    {fields.eligibility[0] == "prerequisite" &&
                        <>
                            <TextField
                                type="Search"
                                value={search}
                                //   onChange={openProductPicker}
                                onFocus={openProductPicker}
                                // prefix={<Icon source={SearchIcon} tone="base" />}
                                placeholder="Search Product"
                                connectedRight={
                                    <Button variant="primary" onClick={openProductPicker}>
                                        Browse
                                    </Button>
                                }
                            />

                            {fields.specificItems?.length > 0 ? (
                                <>
                                    <ResourceList
                                        resourceName={{ singular: "product", plural: "products" }}
                                        items={fields.specificItems}
                                        renderItem={(item) => {
                                            const { id, title, vendor, images } = item;
                                            const imageUrl =
                                                images?.[0]?.originalSrc || svgImage;
                                            return (
                                                <ResourceItem
                                                    id={id}
                                                    accessibilityLabel={`View details for ${title}`}
                                                    media={
                                                        <Thumbnail source={imageUrl} alt="Thumbnail Image" />
                                                    }
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <Text variant="bodyMd" fontWeight="bold" as="h3">
                                                            {title}
                                                        </Text>
                                                        <Button
                                                            plain
                                                            // icon={<Icon source={XIcon} color="inkLightest" />}
                                                            onClick={() => handleRemove(item.id)}
                                                            style={{ marginLeft: "auto" }}
                                                        >X</Button>
                                                    </div>
                                                </ResourceItem>
                                            );
                                        }}
                                    />
                                </>
                            ) : (
                                <></>
                            )}
                            {error?.specificItems && (<div className="text-red-600 mt-2">{error?.specificItems}</div>)}
                        </>
                    }
                </LegacyCard >
                <LegacyCard sectioned title="Goal Message">
                    <TextField
                        label="Message when cart is empty"
                        type='text'
                        value={fields.message1}
                        onChange={(value) => handleChange(value, "message1")}
                        autoComplete="off"
                    />
                    {error?.message1 && (<div className="text-red-600 mt-2">{error?.message1}</div>)}
                    <TextField
                        label="Message when gift goal is met"
                        type='text'
                        value={fields.message2}
                        onChange={(value) => handleChange(value, "message2")}
                        autoComplete="off"
                    />
                    {error?.message2 && (<div className="text-red-600 mt-2">{error?.message2}</div>)}
                </LegacyCard>
                <LegacyCard sectioned>
                    <Button onClick={handleCreateGiftGoal} loading={isPopulating}>
                        Create Gift Goal
                    </Button>
                </LegacyCard>
            </Layout.Section>
            <Layout.Section secondary></Layout.Section>
        </Layout>
    )
}
