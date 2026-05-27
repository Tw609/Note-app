from django.contrib.auth.models import User
from rest_framework import serializers


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={"input_type": "password"},
        error_messages={"min_length": "Password must be at least 8 characters."},
    )

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )
        return user


class ProfileSerializer(serializers.ModelSerializer):
    """Read / update the logged-in user's own profile."""

    current_password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        style={"input_type": "password"},
    )
    new_password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        min_length=8,
        style={"input_type": "password"},
        error_messages={"min_length": "New password must be at least 8 characters."},
    )
    note_count = serializers.SerializerMethodField(read_only=True)
    date_joined = serializers.DateTimeField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "date_joined",
            "note_count",
            "current_password",
            "new_password",
        ]
        read_only_fields = ["id", "date_joined", "note_count"]

    def get_note_count(self, obj):
        return obj.notes.count()

    def validate(self, data):
        new_pw = data.get("new_password", "")
        cur_pw = data.get("current_password", "")
        if new_pw and not cur_pw:
            raise serializers.ValidationError(
                {"current_password": "Enter your current password to set a new one."}
            )
        if new_pw and cur_pw:
            if not self.instance.check_password(cur_pw):
                raise serializers.ValidationError(
                    {"current_password": "Current password is incorrect."}
                )
        return data

    def update(self, instance, validated_data):
        validated_data.pop("current_password", None)
        new_pw = validated_data.pop("new_password", None)

        new_username = validated_data.get("username", instance.username)
        if (
            new_username != instance.username
            and User.objects.filter(username=new_username).exists()
        ):
            raise serializers.ValidationError(
                {"username": "This username is already taken."}
            )

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if new_pw:
            instance.set_password(new_pw)
        instance.save()
        return instance
